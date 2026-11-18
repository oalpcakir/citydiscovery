package app.citydiscovery;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

// Hands the explorer card picture to the app the player shares it with. It serves exactly one file,
// cache/shared/city-disco-card.png, read-only, and only to apps the share intent granted access to
// (the provider is not exported). A tiny stand-in for androidx FileProvider, so the app needs no AndroidX.
public class ShareProvider extends ContentProvider {
    static final String FILE_NAME = "city-disco-card.png";

    static String authority(android.content.Context c) { return c.getPackageName() + ".share"; }

    static File cardFile(android.content.Context c) { return new File(new File(c.getCacheDir(), "shared"), FILE_NAME); }

    static Uri cardUri(android.content.Context c) { return Uri.parse("content://" + authority(c) + "/" + FILE_NAME); }

    private File fileFor(Uri uri) throws FileNotFoundException {
        if (!FILE_NAME.equals(uri.getLastPathSegment())) throw new FileNotFoundException(uri.toString());
        File f = cardFile(getContext());
        if (!f.exists()) throw new FileNotFoundException(uri.toString());
        return f;
    }

    @Override public boolean onCreate() { return true; }

    @Override public String getType(Uri uri) { return "image/png"; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        if (!"r".equals(mode)) throw new SecurityException("read-only");
        return ParcelFileDescriptor.open(fileFor(uri), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    // Some apps ask for the file's name and size before reading it.
    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] args, String sort) {
        File f;
        try { f = fileFor(uri); } catch (FileNotFoundException e) { return null; }
        String[] cols = projection != null ? projection : new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE};
        MatrixCursor c = new MatrixCursor(cols, 1);
        Object[] row = new Object[cols.length];
        for (int i = 0; i < cols.length; i++) {
            if (OpenableColumns.DISPLAY_NAME.equals(cols[i])) row[i] = FILE_NAME;
            else if (OpenableColumns.SIZE.equals(cols[i])) row[i] = f.length();
        }
        c.addRow(row);
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues values) { throw new UnsupportedOperationException(); }
    @Override public int delete(Uri uri, String selection, String[] args) { throw new UnsupportedOperationException(); }
    @Override public int update(Uri uri, ContentValues values, String selection, String[] args) { throw new UnsupportedOperationException(); }
}
