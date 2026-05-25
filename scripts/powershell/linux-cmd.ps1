# ==================== Linux Commands Compatibility ====================

Set-Alias -Name which -Value Get-Command -ErrorAction SilentlyContinue
Set-Alias -Name clear -Value Clear-Host -ErrorAction SilentlyContinue

# -------------------- Help --------------------
$script:LinuxCmdHelp = [ordered]@{
    help     = @"
help [command]
  List all commands, or show usage for one command.
  Also: <command> --help
"@
    cp       = @"
cp [-r] <source>... <dest>
  Copy files or directories (recursive for folders). Overwrites if target exists.
  Examples: cp file.txt backup/   |   cp -r project project-bak
"@
    touch    = "touch <file>`n  Create file or update its last-write time."
    head     = "head <file> [-n 10]`n  Print the first lines of a file."
    tail     = "tail <file> [-n 10] [-f]`n  Print the last lines (-f to follow)."
    ll       = "ll [path]`n  List files in long format."
    la       = "la [path]`n  List all files including hidden."
    grep     = "grep <pattern> [-Path <file>] [-i]`n  Search for a pattern in text."
    tree     = "tree [path] [-Depth 3]`n  Show directory tree."
    df       = "df`n  Show disk space usage."
    du       = "du [path] [-h]`n  Show directory size (-h for human-readable)."
    top      = "top`n  Live process monitor (Ctrl+C to exit)."
    kill     = "kill <pid>`n  Force-stop a process by PID."
    port     = "port <port> [-Protocol TCP|UDP|All]`n  Show which process uses a port."
    killport = "killport <port> [-Protocol TCP|UDP|All]`n  Kill process(es) on a port. Alias: kp"
    kp       = "kp <port>`n  Short alias for killport."
    lsof     = "lsof -i :<port>`n  Linux-style port lookup, e.g. lsof -i :8080"
    fuser    = "fuser <port>[/tcp|udp] [-k]`n  List (-k to kill) processes on a port."
    env      = @"
env [NAME]
  List all environment variables, or print one (alias: get).
  Examples: env   |   env PATH   |   get JAVA_HOME
"@
    get      = "get [NAME]`n  Same as env (read environment variables)."
    set      = @"
set <NAME>=<value>
  Set a session environment variable for current PowerShell.
  Example: set NODE_ENV=development
"@
    export   = "export <NAME>=<value>`n  Same as set (Linux-style name)."
    wget     = "wget <url> [-O <file>]`n  Download a file."
    open     = @"
open [path]
  Open path in File Explorer (. = current folder).
  Files are shown selected; folders open directly.
  Examples: open .   |   open C:\Users   |   open .\README.md
"@
}

$script:LinuxCmdAliases = @{
    kp  = 'killport'
    get = 'env'
}

function Show-LinuxCmdHelp {
    param([string]$Command)

    if (-not $Command) {
        Write-Host "Linux-style commands  (help <name>  |  <name> --help)" -ForegroundColor Cyan
        foreach ($name in $script:LinuxCmdHelp.Keys) {
            if ($script:LinuxCmdAliases.ContainsKey($name)) { continue }
            $summary = ($script:LinuxCmdHelp[$name] -split "`n")[0]
            Write-Host ("  {0,-10} {1}" -f $name, $summary)
        }
        Write-Host ""
        Write-Host "Example: help port" -ForegroundColor DarkGray
        return
    }

    $key = $Command.ToLower()
    if ($script:LinuxCmdAliases.ContainsKey($key)) {
        $key = $script:LinuxCmdAliases[$key]
    }

    if ($script:LinuxCmdHelp.Contains($key)) {
        Write-Host $script:LinuxCmdHelp[$key]
    } else {
        Write-Error "Unknown command: $Command. Run 'help' for a list."
    }
}

function Test-LinuxCmdHelp {
    param(
        [Parameter(Mandatory)][string]$Command,
        [switch]$Help,
        $Argument
    )
    if ($Help) {
        Show-LinuxCmdHelp $Command
        return $true
    }
    if ($null -ne $Argument -and $Argument -in '--help', '-h', '/?') {
        Show-LinuxCmdHelp $Command
        return $true
    }
    return $false
}

function help {
    param(
        [string]$Command,
        [Alias('h')][switch]$Help
    )
    if ($Help -or $Command -in '--help', '-h') {
        Show-LinuxCmdHelp 'help'
        return
    }
    Show-LinuxCmdHelp $Command
}

# -------------------- File & text --------------------

Remove-Item Alias:cp -Force -ErrorAction SilentlyContinue

function cp {
    param(
        [switch]$r,
        [Alias('h')][switch]$Help,
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Path
    )

    if (Test-LinuxCmdHelp cp -Help:$Help -Argument $Path) { return }

    $recursive = $r
    $paths = @($Path | Where-Object { $_ -and $_ -notin '--help', '-h' })

    while ($paths.Count -gt 0 -and $paths[0].StartsWith('-')) {
        switch ($paths[0]) {
            { $_ -cmatch '^-[rR]$' } { $recursive = $true }
            '-f' { } # kept for compatibility; overwrite is always on
            default {
                Write-Error "Unknown option: $($paths[0])"
                return
            }
        }
        $paths = @($paths | Select-Object -Skip 1)
    }

    if ($paths.Count -lt 2) {
        Show-LinuxCmdHelp cp
        return
    }

    $dest = $paths[-1]
    $sources = $paths[0..($paths.Count - 2)]

    if ($sources.Count -gt 1 -and -not (Test-Path -LiteralPath $dest -PathType Container)) {
        Write-Error "When copying multiple items, destination must be an existing directory: $dest"
        return
    }

    foreach ($src in $sources) {
        if (-not (Test-Path -LiteralPath $src)) {
            Write-Error "Source not found: $src"
            continue
        }

        $item = Get-Item -LiteralPath $src
        $useRecurse = $recursive -or $item.PSIsContainer
        $destIsDir = Test-Path -LiteralPath $dest -PathType Container
        $destExists = Test-Path -LiteralPath $dest

        try {
            if ($destIsDir) {
                $destResolved = (Resolve-Path -LiteralPath $dest).Path
                $targetPath = Join-Path $destResolved $item.Name
                if (Test-Path -LiteralPath $targetPath) {
                    Remove-Item -LiteralPath $targetPath -Recurse -Force
                }
                $copyDest = $destResolved
            } else {
                $targetPath = if ($destExists) {
                    (Resolve-Path -LiteralPath $dest).Path
                } else {
                    $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($dest)
                }
                if (Test-Path -LiteralPath $targetPath) {
                    Remove-Item -LiteralPath $targetPath -Recurse -Force
                }
                $copyDest = $targetPath
            }

            if ($useRecurse) {
                if ($destIsDir) {
                    Copy-Item -LiteralPath $src -Destination $copyDest -Recurse -Force
                } else {
                    Copy-Item -LiteralPath $src -Destination $copyDest -Recurse -Force
                }
            } elseif ($destIsDir) {
                Copy-Item -LiteralPath $src -Destination $copyDest -Force
            } else {
                Copy-Item -LiteralPath $src -Destination $copyDest -Force
            }

            Write-Host "Copied: $src -> $dest" -ForegroundColor Green
        } catch {
            Write-Error "Failed to copy '$src': $_"
        }
    }
}

function touch {
    param([string]$file, [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp touch -Help:$Help -Argument $file) { return }
    if (-not $file) { Show-LinuxCmdHelp touch; return }
    if (Test-Path $file) {
        (Get-Item $file).LastWriteTime = Get-Date
    } else {
        New-Item -ItemType File -Path $file -Force | Out-Null
    }
}

function head {
    param([string]$Path, [int]$n = 10, [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp head -Help:$Help -Argument $Path) { return }
    if (-not $Path -or $Path -in '--help', '-h') { Show-LinuxCmdHelp head; return }
    Get-Content $Path -Head $n
}

function tail {
    param([string]$Path, [int]$n = 10, [switch]$f, [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp tail -Help:$Help -Argument $Path) { return }
    if (-not $Path -or $Path -in '--help', '-h') { Show-LinuxCmdHelp tail; return }
    if ($f) {
        Get-Content $Path -Tail $n -Wait
    } else {
        Get-Content $Path -Tail $n
    }
}

function ll {
    param([string]$Path = ".", [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp ll -Help:$Help -Argument $Path) { return }
    Get-ChildItem -Path $Path | Format-Table Mode, LastWriteTime, Length, Name -AutoSize
}

function la {
    param([string]$Path = ".", [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp la -Help:$Help -Argument $Path) { return }
    Get-ChildItem -Path $Path -Force | Format-Table Mode, LastWriteTime, Length, Name -AutoSize
}

function grep {
    param(
        [string]$Pattern,
        [Parameter(ValueFromPipeline = $true)][string]$InputObject,
        [string]$Path,
        [switch]$i,
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp grep -Help:$Help -Argument $Pattern) { return }
    if (-not $Pattern -or $Pattern -in '--help', '-h') { Show-LinuxCmdHelp grep; return }
    process {
        if ($Path) {
            $content = Get-Content $Path
            foreach ($line in $content) {
                $match = if ($i) { $line -imatch $Pattern } else { $line -cmatch $Pattern }
                if ($match) { Write-Output $line }
            }
        } else {
            $match = if ($i) { $InputObject -imatch $Pattern } else { $InputObject -cmatch $Pattern }
            if ($match) { Write-Output $InputObject }
        }
    }
}

function tree {
    param(
        [string]$Path = ".",
        [int]$Depth = 3,
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp tree -Help:$Help -Argument $Path) { return }

    function Show-Tree {
        param($Path, $Level = 0, $MaxDepth)
        if ($Level -ge $MaxDepth) { return }

        $indent = "  " * $Level
        $items = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue

        foreach ($item in $items) {
            if ($item.PSIsContainer) {
                Write-Host "$indent- $($item.Name)/" -ForegroundColor Cyan
                Show-Tree -Path $item.FullName -Level ($Level + 1) -MaxDepth $MaxDepth
            } else {
                Write-Host "$indent- $($item.Name)"
            }
        }
    }

    Write-Host $Path -ForegroundColor Yellow
    Show-Tree -Path $Path -Level 0 -MaxDepth $Depth
}

function df {
    param([Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp df -Help:$Help) { return }
    Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | Select-Object Name,
        @{ Name = "Size(GB)"; Expression = { [math]::Round(($_.Used + $_.Free) / 1GB, 2) } },
        @{ Name = "Used(GB)"; Expression = { [math]::Round($_.Used / 1GB, 2) } },
        @{ Name = "Free(GB)"; Expression = { [math]::Round($_.Free / 1GB, 2) } },
        @{ Name = "Use%"; Expression = { [math]::Round($_.Used / ($_.Used + $_.Free) * 100, 1) } } |
        Format-Table -AutoSize
}

function du {
    param([string]$Path = ".", [switch]$h, [switch]$Help)
    if (Test-LinuxCmdHelp du -Help:$Help -Argument $Path) { return }
    if ($Path -in '--help') { Show-LinuxCmdHelp du; return }
    $size = (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Measure-Object -Property Length -Sum).Sum
    if ($h) {
        if ($size -gt 1GB) {
            Write-Output "$([math]::Round($size / 1GB, 2)) GB"
        } elseif ($size -gt 1MB) {
            Write-Output "$([math]::Round($size / 1MB, 2)) MB"
        } elseif ($size -gt 1KB) {
            Write-Output "$([math]::Round($size / 1KB, 2)) KB"
        } else {
            Write-Output "$size B"
        }
    } else {
        Write-Output $size
    }
}

function top {
    param([Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp top -Help:$Help) { return }
    while ($true) {
        Clear-Host
        Write-Host "Process Monitor (Ctrl+C to exit)" -ForegroundColor Cyan
        Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 Id, ProcessName,
            @{ Name = "CPU"; Expression = { [math]::Round($_.CPU, 2) } },
            @{ Name = "Mem(MB)"; Expression = { [math]::Round($_.WorkingSet / 1MB, 2) } } |
            Format-Table -AutoSize
        Start-Sleep -Seconds 2
    }
}

function kill {
    param($Id, [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp kill -Help:$Help -Argument $Id) { return }
    if ($null -eq $Id -or $Id -in '--help', '-h') { Show-LinuxCmdHelp kill; return }
    Stop-Process -Id ([int]$Id) -Force
}

# -------------------- Ports --------------------

function Get-PortOwners {
    param(
        [Parameter(Mandatory)][int]$Port,
        [ValidateSet('TCP', 'UDP', 'All')][string]$Protocol = 'TCP'
    )

    $pids = [System.Collections.Generic.HashSet[int]]::new()

    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        if ($Protocol -in 'TCP', 'All') {
            Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                ForEach-Object { [void]$pids.Add($_.OwningProcess) }
        }
        if ($Protocol -in 'UDP', 'All') {
            Get-NetUDPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                ForEach-Object { [void]$pids.Add($_.OwningProcess) }
        }
    } else {
        $patterns = @()
        if ($Protocol -in 'TCP', 'All') { $patterns += 'TCP' }
        if ($Protocol -in 'UDP', 'All') { $patterns += 'UDP' }
        netstat -ano | ForEach-Object {
            $line = $_.Trim()
            foreach ($proto in $patterns) {
                if ($line -match "^$proto\s+\S+:(\d+)\s+\S+:\d+\s+\S+\s+(\d+)$" -and [int]$Matches[1] -eq $Port) {
                    [void]$pids.Add([int]$Matches[2])
                }
            }
        }
    }

    $pids | Where-Object { $_ -gt 0 }
}

function Show-PortUsage {
    param(
        [Parameter(Mandatory)][int]$Port,
        [ValidateSet('TCP', 'UDP', 'All')][string]$Protocol = 'TCP'
    )

    $owners = Get-PortOwners -Port $Port -Protocol $Protocol
    if (-not $owners) {
        Write-Host "No process is using port $Port" -ForegroundColor Yellow
        return
    }

    $rows = foreach ($procId in $owners) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            Port = $Port
            PID  = $procId
            Name = if ($proc) { $proc.ProcessName } else { '(exited)' }
            Path = if ($proc) { $proc.Path } else { $null }
        }
    }

    $rows | Format-Table -AutoSize
    if ($rows.Count -eq 1) {
        Write-Host "Kill: killport $Port  (or: kp $Port)" -ForegroundColor DarkGray
    }
}

function lsof {
    param(
        [string]$i,
        $Port,
        [ValidateSet('TCP', 'UDP', 'All')][string]$Protocol = 'TCP',
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp lsof -Help:$Help -Argument $i) { return }
    if ($i) {
        if ($i -match ':(\d+)\s*$') { $Port = [int]$Matches[1] }
        if ($i -match '^UDP') { $Protocol = 'UDP' }
        elseif ($i -match '^TCP') { $Protocol = 'TCP' }
    }
    if (-not $Port -or $Port -in '--help', '-h') { Show-LinuxCmdHelp lsof; return }
    Show-PortUsage -Port ([int]$Port) -Protocol $Protocol
}

function port {
    param(
        $n,
        [ValidateSet('TCP', 'UDP', 'All')][string]$Protocol = 'TCP',
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp port -Help:$Help -Argument $n) { return }
    if ($null -eq $n -or $n -in '--help', '-h') { Show-LinuxCmdHelp port; return }
    Show-PortUsage -Port ([int]$n) -Protocol $Protocol
}

function killport {
    param(
        $n,
        [ValidateSet('TCP', 'UDP', 'All')][string]$Protocol = 'TCP',
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp killport -Help:$Help -Argument $n) { return }
    if ($null -eq $n -or $n -in '--help', '-h') { Show-LinuxCmdHelp killport; return }

    $owners = @(Get-PortOwners -Port ([int]$n) -Protocol $Protocol)
    if (-not $owners) {
        Write-Host "No process is using port $n" -ForegroundColor Yellow
        return
    }

    foreach ($procId in $owners) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $label = if ($proc) { "$($proc.ProcessName) (PID $procId)" } else { "PID $procId" }
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "Killed $label on port $n" -ForegroundColor Green
        } catch {
            Write-Error "Failed to kill $label : $_"
        }
    }
}

function fuser {
    param(
        [Parameter(Position = 0)]$PortSpec,
        [switch]$k,
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp fuser -Help:$Help -Argument $PortSpec) { return }
    if (-not $PortSpec -or $PortSpec -in '--help', '-h') { Show-LinuxCmdHelp fuser; return }

    if ($PortSpec -notmatch '^(\d+)(?:/(tcp|udp))?$') {
        Write-Error "Usage: fuser <port>[/tcp|udp] [-k]   e.g. fuser -k 8080/tcp"
        return
    }

    $portNum = [int]$Matches[1]
    $proto = if ($Matches[2]) { $Matches[2].ToUpper() } else { 'TCP' }

    if ($k) {
        killport -n $portNum -Protocol $proto
    } else {
        port -n $portNum -Protocol $proto
    }
}

Set-Alias -Name kp -Value killport -ErrorAction SilentlyContinue
Set-Alias -Name get -Value env -ErrorAction SilentlyContinue

# -------------------- Environment --------------------

Remove-Item Alias:set -Force -ErrorAction SilentlyContinue

function env {
    param(
        [string]$Name,
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp env -Help:$Help -Argument $Name) { return }
    if ($Name -in '--help', '-h') { Show-LinuxCmdHelp env; return }

    if ($Name) {
        if (Test-Path "Env:$Name") {
            (Get-Item "Env:$Name").Value
        }
        return
    }

    Get-ChildItem Env: | Format-Table Name, Value -AutoSize
}

function set {
    param(
        [string]$Expression,
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp set -Help:$Help -Argument $Expression) { return }
    if (-not $Expression -or $Expression -in '--help', '-h') { Show-LinuxCmdHelp set; return }

    if ($Expression -match '^([^=]+)=(.*)$') {
        $name = $Matches[1].Trim()
        $value = $Matches[2]
        Set-Item -Path "Env:$name" -Value $value
        return
    }

    Write-Error "Usage: set NAME=value   e.g. set NODE_ENV=development"
}

function export {
    param(
        [string]$Expression,
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp export -Help:$Help -Argument $Expression) { return }
    set -Expression $Expression
}

# -------------------- Network --------------------

function wget {
    param([string]$Url, [string]$O, [Alias('h')][switch]$Help)
    if (Test-LinuxCmdHelp wget -Help:$Help -Argument $Url) { return }
    if (-not $Url -or $Url -in '--help', '-h') { Show-LinuxCmdHelp wget; return }
    if (!$O) { $O = Split-Path $Url -Leaf }
    try {
        Invoke-WebRequest -Uri $Url -OutFile $O
        Write-Host "Downloaded: $O" -ForegroundColor Green
    } catch {
        Write-Error "Download failed"
    }
}

function open {
    param(
        [string]$Path = ".",
        [Alias('h')][switch]$Help
    )
    if (Test-LinuxCmdHelp open -Help:$Help -Argument $Path) { return }
    if ($Path -in '--help', '-h') { Show-LinuxCmdHelp open; return }

    $target = if ($Path -eq ".") { (Get-Location).Path } else { $Path }
    if (-not (Test-Path -LiteralPath $target)) {
        Write-Error "Path not found: $Path"
        return
    }

    $resolved = (Resolve-Path -LiteralPath $target).Path
    if (Test-Path -LiteralPath $resolved -PathType Leaf) {
        Start-Process explorer.exe -ArgumentList "/select,`"$resolved`""
    } else {
        Start-Process explorer.exe -ArgumentList "`"$resolved`""
    }
}

# -------------------- Startup --------------------

Write-Host ""
Write-Host "Linux commands loaded!  (help | <cmd> --help)" -ForegroundColor Green
Write-Host ""
