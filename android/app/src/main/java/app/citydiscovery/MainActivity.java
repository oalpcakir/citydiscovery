package app.citydiscovery;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * İnce kabuk: içerik her açılışta APP_URL'den çekilir (anlık güncelleme).
 * Ağ yoksa son indirilen kopya, o da yoksa APK'ya gömülü kopya aynı adres altında sunulur;
 * böylece ilerleme (localStorage) her durumda aynı yerde kalır.
 */
public class MainActivity extends Activity {
    private static final String BASE = BuildConfig.APP_URL;
    private static final long OFFLINE_BACKOFF_MS = 30_000;

    private WebView web;
    private File cacheDir;
    private volatile long offlineUntil = 0;
    private static final int REQ_LOCATION = 1;
    private GeolocationPermissions.Callback pendingGeo;
    private String pendingGeoOrigin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Önbellek sürüme bağlı: yeni APK kurulunca eski indirilenler gömülü kopyayı ezmesin.
        cacheDir = new File(getFilesDir(), "web-v" + BuildConfig.VERSION_CODE);
        cacheDir.mkdirs();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setUserAgentString(s.getUserAgentString() + " CityDiscoveryShell/" + BuildConfig.VERSION_NAME);
        s.setGeolocationEnabled(true);
        web.setWebChromeClient(new WebChromeClient() {
            // Haritadaki "konumum" düğmesi: Android konum izni yoksa önce onu iste.
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (!origin.startsWith(Uri.parse(BASE).getScheme() + "://" + Uri.parse(BASE).getHost())) {
                    callback.invoke(origin, false, false);
                } else if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    pendingGeo = callback;
                    pendingGeoOrigin = origin;
                    requestPermissions(new String[] {
                        Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }, REQ_LOCATION);
                }
            }
        });
        web.setWebViewClient(new Client());
        setContentView(web);

        if (savedInstanceState == null) web.loadUrl(BASE);
        else web.restoreState(savedInstanceState);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode != REQ_LOCATION || pendingGeo == null) return;
        boolean granted = false;
        for (int r : results) granted |= r == PackageManager.PERMISSION_GRANTED;
        pendingGeo.invoke(pendingGeoOrigin, granted, false);
        pendingGeo = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("!!(window.cdBack && window.cdBack())", handled -> {
            if (!"true".equals(handled)) finish();
        });
    }

    private class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            String url = req.getUrl().toString();
            if (url.startsWith(BASE)) return false;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception ignored) { /* açacak uygulama yok */ }
            return true;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            String url = req.getUrl().toString();
            if (!"GET".equals(req.getMethod()) || !url.startsWith(BASE)) return null;

            String path = url.substring(BASE.length());
            int cut = path.indexOf('?');
            if (cut >= 0) path = path.substring(0, cut);
            cut = path.indexOf('#');
            if (cut >= 0) path = path.substring(0, cut);
            if (path.isEmpty() || path.endsWith("/")) path += "index.html";
            if (path.contains("..")) return notFound();

            byte[] data = fromNetwork(path);
            if (data == null) data = fromCache(path);
            if (data == null) data = fromAssets(path);
            if (data == null) return notFound();

            String mime = mimeOf(path);
            boolean text = mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json") || mime.contains("svg");
            return new WebResourceResponse(mime, text ? "utf-8" : null, new ByteArrayInputStream(data));
        }
    }

    private byte[] fromNetwork(String path) {
        if (System.currentTimeMillis() < offlineUntil) return null;
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(BASE + path).openConnection();
            c.setConnectTimeout(4000);
            c.setReadTimeout(6000);
            c.setUseCaches(false);
            c.setRequestProperty("Cache-Control", "no-cache");
            if (c.getResponseCode() != 200) return null; // ör. henüz yayınlanmamış: gömülü kopyaya düş
            byte[] data = readAll(c.getInputStream());
            File f = new File(cacheDir, path);
            File parent = f.getParentFile();
            if (parent != null) parent.mkdirs();
            File tmp = new File(f.getPath() + ".tmp");
            try (FileOutputStream out = new FileOutputStream(tmp)) { out.write(data); }
            if (!tmp.renameTo(f)) tmp.delete();
            return data;
        } catch (Exception e) {
            offlineUntil = System.currentTimeMillis() + OFFLINE_BACKOFF_MS;
            return null;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private byte[] fromCache(String path) {
        File f = new File(cacheDir, path);
        if (!f.isFile()) return null;
        try (InputStream in = new FileInputStream(f)) { return readAll(in); } catch (Exception e) { return null; }
    }

    private byte[] fromAssets(String path) {
        try (InputStream in = getAssets().open("web/" + path)) { return readAll(in); } catch (Exception e) { return null; }
    }

    private static byte[] readAll(InputStream in) throws java.io.IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        in.close();
        return out.toByteArray();
    }

    private static WebResourceResponse notFound() {
        WebResourceResponse r = new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
        r.setStatusCodeAndReasonPhrase(404, "Not Found");
        return r;
    }

    private static String mimeOf(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }
}
