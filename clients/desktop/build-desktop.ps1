$msvc = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207"
$sdk = "C:\Program Files (x86)\Windows Kits\10"
$sdkVer = "10.0.26100.0"

$env:Path = "$msvc\bin\Hostx64\x64;$sdk\bin\$sdkVer\x64;$sdk\bin\x64;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$env:INCLUDE = "$msvc\include;$sdk\include\$sdkVer\ucrt;$sdk\include\$sdkVer\um;$sdk\include\$sdkVer\shared"
$env:LIB = "$msvc\lib\x64;$sdk\lib\$sdkVer\ucrt\x64;$sdk\lib\$sdkVer\um\x64"
$env:LIBPATH = "$msvc\lib\x64"

Write-Host "Building ComicReader Desktop..."
npm run tauri:build