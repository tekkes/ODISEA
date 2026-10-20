param([string]$AppDir = $PSScriptRoot)

if ([string]::IsNullOrWhiteSpace($AppDir)) {
    $AppDir = (Get-Location).Path
}

$port = 1420
$root = Join-Path $AppDir "www"
$dataDir = Join-Path $AppDir "odisea_data"
if (!(Test-Path $dataDir)) {
    [System.IO.Directory]::CreateDirectory($dataDir) | Out-Null
}
$logFile = Join-Path $dataDir "server.log"

function Log-Msg($msg) {
    try {
        $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        $line = "[$timestamp] $msg"
        [System.IO.File]::AppendAllText($logFile, $line + "`r`n")
    } catch {}
}

Log-Msg "=========================================="
Log-Msg "Iniciando servidor Odisea en puerto $port..."
Log-Msg "AppDir: $AppDir"
Log-Msg "Root WWW: $root"

# 1. Iniciar socket TCP nativo (Winsock, sin dependencias de http.sys ni netsh)
$listener = $null
try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::IPv6Any, $port)
    $listener.Server.DualMode = $true
    $listener.Start()
    Log-Msg "TcpListener iniciado con éxito en IPv6Any (DualMode=true) en puerto $port"
} catch {
    Log-Msg "DualMode IPv6 no disponible ($($_.Exception.Message)). Intentando IPv4 Any..."
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
        $listener.Start()
        Log-Msg "TcpListener iniciado con éxito en IPv4 Any (0.0.0.0:$port)"
    } catch {
        Log-Msg "ERROR FATAL: No se pudo enlazar el puerto $port: $($_.Exception.Message)"
        exit 1
    }
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".svg"   = "image/svg+xml"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".ico"   = "image/x-icon"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
}

Log-Msg "Servidor activo. Esperando conexiones de Odisea..."

# 2. Bucle principal de atencion HTTP
while ($listener.Server.IsBound) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 4000
        $stream.WriteTimeout = 4000

        $buf = New-Object byte[] 8192
        $readCount = $stream.Read($buf, 0, $buf.Length)
        if ($readCount -gt 0) {
            $reqText = [System.Text.Encoding]::ASCII.GetString($buf, 0, $readCount)
            $firstLine = ($reqText -split "`r`n")[0]
            $parts = $firstLine -split " "
            $method = $parts[0]
            $rawPath = if ($parts.Length -gt 1) { $parts[1] } else { "/" }

            # Responder a OPTIONS inmediatamente
            if ($method -eq "OPTIONS") {
                $optHeader = "HTTP/1.1 204 No Content`r`n" +
                             "Access-Control-Allow-Origin: *`r`n" +
                             "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
                             "Access-Control-Allow-Headers: *`r`n" +
                             "Connection: close`r`n`r`n"
                $optBytes = [System.Text.Encoding]::UTF8.GetBytes($optHeader)
                $stream.Write($optBytes, 0, $optBytes.Length)
                $stream.Flush()
                $client.Close()
                continue
            }

            # Limpiar ruta
            $cleanPath = $rawPath.Split('?')[0].TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($cleanPath) -or $cleanPath -eq "/") {
                $cleanPath = "index.html"
            }
            $cleanPath = [System.Uri]::UnescapeDataString($cleanPath).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $target = Join-Path $root $cleanPath

            # Fallback SPA si no tiene extension
            if (!(Test-Path $target -PathType Leaf)) {
                if (![System.IO.Path]::HasExtension($cleanPath)) {
                    $target = Join-Path $root "index.html"
                }
            }

            if (Test-Path $target -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($target).ToLower()
                $ct = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $data = [System.IO.File]::ReadAllBytes($target)

                $header = "HTTP/1.1 200 OK`r`n" +
                          "Content-Type: $ct`r`n" +
                          "Content-Length: $($data.Length)`r`n" +
                          "Access-Control-Allow-Origin: *`r`n" +
                          "Connection: close`r`n`r`n"
                $hBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($data, 0, $data.Length)
                Log-Msg "200 OK: $method $rawPath ($($data.Length) bytes)"
            } else {
                $nf = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                $nfBytes = [System.Text.Encoding]::UTF8.GetBytes($nf)
                $stream.Write($nfBytes, 0, $nfBytes.Length)
                Log-Msg "404 NOT FOUND: $method $rawPath (buscado: $target)"
            }
        }
        $stream.Flush()
        $client.Close()
    } catch {
        # Ignorar desconexiones rapidas del cliente
    }
}
