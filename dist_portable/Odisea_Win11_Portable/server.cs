using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Collections.Generic;

class OdiseaLauncher {
    static int port = 1420;
    static string rootDir;
    static string logFile;
    static TcpListener listenerV4;
    static TcpListener listenerV6;
    static volatile bool isRunning = true;

    static Dictionary<string, string> mimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
        { ".html", "text/html; charset=utf-8" },
        { ".htm", "text/html; charset=utf-8" },
        { ".js", "application/javascript; charset=utf-8" },
        { ".mjs", "application/javascript; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".svg", "image/svg+xml" },
        { ".png", "image/png" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".gif", "image/gif" },
        { ".ico", "image/x-icon" },
        { ".woff", "font/woff" },
        { ".woff2", "font/woff2" },
        { ".ttf", "font/ttf" }
    };

    static void Log(string msg) {
        try {
            string line = string.Format("[{0:yyyy-MM-dd HH:mm:ss}] {1}", DateTime.Now, msg);
            File.AppendAllText(logFile, line + "\r\n");
        } catch {}
    }

    static void CopyDirectory(string sourceDir, string destDir) {
        Directory.CreateDirectory(destDir);
        foreach (string file in Directory.GetFiles(sourceDir)) {
            string dest = Path.Combine(destDir, Path.GetFileName(file));
            File.Copy(file, dest, true);
        }
        foreach (string dir in Directory.GetDirectories(sourceDir)) {
            string dest = Path.Combine(destDir, Path.GetFileName(dir));
            CopyDirectory(dir, dest);
        }
    }

    [STAThread]
    static void Main(string[] args) {
        string appDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\', '/');
        rootDir = Path.Combine(appDir, "www");
        string dataDir = Path.Combine(appDir, "odisea_data");
        if (!Directory.Exists(dataDir)) Directory.CreateDirectory(dataDir);
        logFile = Path.Combine(dataDir, "server.log");

        Log("==========================================");
        Log("Iniciando Odisea Launcher nativo.");
        Log("AppDir: " + appDir);

        // 1. Sincronizar www si hace falta
        if (!Directory.Exists(rootDir) || !File.Exists(Path.Combine(rootDir, "index.html"))) {
            string distDir = Path.GetFullPath(Path.Combine(appDir, @"..\..\dist"));
            if (Directory.Exists(distDir)) {
                Log("Copiando dist a www...");
                try { CopyDirectory(distDir, rootDir); } catch (Exception ex) { Log("Error al copiar www: " + ex.Message); }
            }
        }
        Log("WWW: " + rootDir);

        // 2. Iniciar Servidores TCP (IPv4 y IPv6)
        try {
            listenerV4 = new TcpListener(IPAddress.Any, port);
            listenerV4.Start();
            Log("TcpListener IPv4 iniciado en 0.0.0.0:" + port);
            Thread t4 = new Thread(() => AcceptLoop(listenerV4));
            t4.IsBackground = true;
            t4.Start();
        } catch (Exception ex) {
            Log("Error al iniciar IPv4: " + ex.Message);
        }

        try {
            listenerV6 = new TcpListener(IPAddress.IPv6Any, port);
            listenerV6.Start();
            Log("TcpListener IPv6 iniciado en [::]:" + port);
            Thread t6 = new Thread(() => AcceptLoop(listenerV6));
            t6.IsBackground = true;
            t6.Start();
        } catch (Exception ex) {
            Log("Aviso IPv6: " + ex.Message);
        }

        // Breve pausa para asegurar socket listo
        Thread.Sleep(300);

        // 3. Ejecutar odisea.exe
        string exePath = Path.Combine(appDir, "odisea.exe");
        if (!File.Exists(exePath)) {
            Log("ERROR FATAL: No se encuentra odisea.exe en " + exePath);
            return;
        }

        Log("Lanzando proceso: " + exePath);
        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = exePath;
        psi.WorkingDirectory = appDir;
        psi.UseShellExecute = false;

        try {
            Process p = Process.Start(psi);
            if (p != null) {
                p.WaitForExit();
                Log("odisea.exe ha finalizado con código: " + p.ExitCode);
            }
        } catch (Exception ex) {
            Log("Error al ejecutar odisea.exe: " + ex.Message);
        } finally {
            isRunning = false;
            try { if (listenerV4 != null) listenerV4.Stop(); } catch {}
            try { if (listenerV6 != null) listenerV6.Stop(); } catch {}
            Log("Servidor detenido limpiamente.");
        }
    }

    static void AcceptLoop(TcpListener listener) {
        while (isRunning) {
            try {
                TcpClient client = listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(HandleClient, client);
            } catch {
                if (!isRunning) break;
            }
        }
    }

    static void HandleClient(object obj) {
        TcpClient client = (TcpClient)obj;
        try {
            using (NetworkStream stream = client.GetStream()) {
                stream.ReadTimeout = 4000;
                stream.WriteTimeout = 4000;

                byte[] buf = new byte[8192];
                int bytesRead = stream.Read(buf, 0, buf.Length);
                if (bytesRead <= 0) return;

                string req = Encoding.ASCII.GetString(buf, 0, bytesRead);
                string firstLine = req.Split(new[] { "\r\n" }, StringSplitOptions.None)[0];
                string[] parts = firstLine.Split(' ');
                string method = parts[0];
                string rawUrl = parts.Length > 1 ? parts[1] : "/";

                if (method == "OPTIONS") {
                    string opt = "HTTP/1.1 204 No Content\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: *\r\nConnection: close\r\n\r\n";
                    byte[] optB = Encoding.UTF8.GetBytes(opt);
                    stream.Write(optB, 0, optB.Length);
                    return;
                }

                string urlPath = rawUrl.Split('?')[0].TrimStart('/');
                if (string.IsNullOrEmpty(urlPath) || urlPath == "/") urlPath = "index.html";
                urlPath = Uri.UnescapeDataString(urlPath).Replace('/', Path.DirectorySeparatorChar);

                string target = Path.Combine(rootDir, urlPath);
                if (!File.Exists(target)) {
                    if (string.IsNullOrEmpty(Path.GetExtension(urlPath))) {
                        target = Path.Combine(rootDir, "index.html");
                    }
                }

                if (File.Exists(target)) {
                    string ext = Path.GetExtension(target);
                    string ct = "application/octet-stream";
                    if (mimeTypes.ContainsKey(ext)) ct = mimeTypes[ext];

                    byte[] data = File.ReadAllBytes(target);
                    string header = string.Format(
                        "HTTP/1.1 200 OK\r\nContent-Type: {0}\r\nContent-Length: {1}\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n",
                        ct, data.Length
                    );
                    byte[] hBytes = Encoding.UTF8.GetBytes(header);
                    stream.Write(hBytes, 0, hBytes.Length);
                    stream.Write(data, 0, data.Length);
                    Log("200 OK: " + method + " " + rawUrl + " (" + data.Length + " bytes)");
                } else {
                    string nf = "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found";
                    byte[] nfBytes = Encoding.UTF8.GetBytes(nf);
                    stream.Write(nfBytes, 0, nfBytes.Length);
                    Log("404 NOT FOUND: " + method + " " + rawUrl);
                }
            }
        } catch {}
        finally {
            try { client.Close(); } catch {}
        }
    }
}
