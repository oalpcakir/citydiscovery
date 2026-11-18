package app.citydiscovery;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Thin shell: the app is loaded from APP_URL on every launch, so publishing the website updates the app.
 * Files are revalidated with ETags (a 304 reply serves the local copy, so nothing is re-downloaded).
 * Offline, the last downloaded copy is served, and failing that the copy bundled in the APK, always under
 * the same address so progress stored in localStorage stays in one place.
 */
public class MainActivity extends Activity {
    private static final String BASE = BuildConfig.APP_URL;
    private static final long OFFLINE_BACKOFF_MS = 30_000;
    private static final int REQ_LOCATION = 1;
    private static final int REQ_FILE = 2;
    private ValueCallback<Uri[]> fileCallback;

    private WebView web;
    private File cacheDir;
    private volatile long offlineUntil = 0;
    private GeolocationPermissions.Callback pendingGeo;
    private String pendingGeoOrigin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The cache is tied to the APK version so a newer bundled copy is never shadowed by older downloads.
        cacheDir = new File(getFilesDir(), "web-v" + BuildConfig.VERSION_CODE);
        cacheDir.mkdirs();
        removeOldCaches();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setGeolocationEnabled(true);
        s.setUserAgentString(s.getUserAgentString() + " CityDiscoveryShell/" + BuildConfig.VERSION_NAME);
        web.setWebChromeClient(new WebChromeClient() {
            // The map's "my location" button: ask for the Android permission first if needed.
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                Uri base = Uri.parse(BASE);
                if (!origin.startsWith(base.getScheme() + "://" + base.getHost())) {
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

            // "Add photo" on a quest: open the system picker (gallery, files, or camera apps that offer it).
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent pick = params.createIntent();
                    if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    startActivityForResult(Intent.createChooser(pick, "Add a photo"), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });
        web.setWebViewClient(new Client());
        web.addJavascriptInterface(new ShareBridge(), "CityDiscoAndroid");
        setContentView(web);

        if (savedInstanceState == null) web.loadUrl(BASE);
        else web.restoreState(savedInstanceState);
    }

    private void removeOldCaches() {
        File[] dirs = getFilesDir().listFiles();
        if (dirs == null) return;
        for (File d : dirs) {
            if (d.isDirectory() && d.getName().startsWith("web-v") && !d.equals(cacheDir)) deleteTree(d);
        }
    }

    private static void deleteTree(File f) {
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        f.delete();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_FILE || fileCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                result = new Uri[n];
                for (int i = 0; i < n; i++) result[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data.getData() != null) {
                result = new Uri[] { data.getData() };
            }
        }
        fileCallback.onReceiveValue(result);
        fileCallback = null;
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
            } catch (Exception ignored) { /* no app can open it */ }
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
        File f = new File(cacheDir, path);
        File tagFile = new File(f.getPath() + ".etag");
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(BASE + path).openConnection();
            c.setConnectTimeout(4000);
            c.setReadTimeout(8000);
            c.setUseCaches(false);
            if (f.isFile() && tagFile.isFile()) c.setRequestProperty("If-None-Match", readText(tagFile));
            int code = c.getResponseCode();
            if (code == HttpURLConnection.HTTP_NOT_MODIFIED) return fromCache(path);
            if (code != HttpURLConnection.HTTP_OK) return null; // e.g. not published yet: fall back to the bundled copy
            byte[] data = readAll(c.getInputStream());
            File parent = f.getParentFile();
            if (parent != null) parent.mkdirs();
            File tmp = new File(f.getPath() + ".tmp");
            try (FileOutputStream out = new FileOutputStream(tmp)) { out.write(data); }
            if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) tmp.delete(); }
            String etag = c.getHeaderField("ETag");
            if (etag != null) {
                try (FileOutputStream out = new FileOutputStream(tagFile)) { out.write(etag.getBytes(StandardCharsets.UTF_8)); }
            } else {
                tagFile.delete();
            }
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

    private static String readText(File f) throws java.io.IOException {
        try (InputStream in = new FileInputStream(f)) { return new String(readAll(in), StandardCharsets.UTF_8).trim(); }
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

    private class ShareBridge {
        @JavascriptInterface
        public void shareImage(final String base64DataUrl) {
            runOnUiThread(() -> {
                try {
                    String pureBase64 = base64DataUrl.contains(",") ? base64DataUrl.split(",", 2)[1] : base64DataUrl;
                    byte[] bytes = Base64.decode(pureBase64, Base64.DEFAULT);
                    File imgFile = ShareProvider.cardFile(MainActivity.this);
                    imgFile.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(imgFile)) {
                        fos.write(bytes);
                    }
                    Uri uri = ShareProvider.cardUri(MainActivity.this);
                    Intent intent = new Intent(Intent.ACTION_SEND);
                    intent.setType("image/png");
                    intent.putExtra(Intent.EXTRA_STREAM, uri);
                    // The ClipData carries the read grant through the chooser to the app the player picks.
                    intent.setClipData(ClipData.newRawUri(ShareProvider.FILE_NAME, uri));
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(intent, "Share your City Disco card"));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Could not open sharing. Please try again.", Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
