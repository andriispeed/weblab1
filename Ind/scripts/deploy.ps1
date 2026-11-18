param(
    [Parameter(Mandatory=$true)][string]$SshKey,
    [string]$Remote = 'admin@45.153.48.230'
)
$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$releaseInfo = Get-Content -LiteralPath (Join-Path $projectPath 'releases\latest.json') -Raw | ConvertFrom-Json
if ($releaseInfo.id -notmatch '^\d{8}-\d{6}$') { throw 'Invalid release id' }
if (!(Test-Path -LiteralPath $SshKey)) { throw 'SSH key not found' }
& ssh -i $SshKey -o BatchMode=yes -o StrictHostKeyChecking=yes $Remote 'mkdir -p /home/admin/it-school-upload'
if ($LASTEXITCODE -ne 0) { throw 'SSH preparation failed' }
& scp -i $SshKey -o BatchMode=yes -o StrictHostKeyChecking=yes $releaseInfo.archive "${Remote}:/home/admin/it-school-upload/"
if ($LASTEXITCODE -ne 0) { throw 'Archive upload failed' }
& scp -i $SshKey -o BatchMode=yes -o StrictHostKeyChecking=yes (Join-Path $projectPath 'infra\deploy.py') "${Remote}:/home/admin/it-school-upload/deploy.py"
if ($LASTEXITCODE -ne 0) { throw 'Deploy script upload failed' }
& ssh -i $SshKey -o BatchMode=yes -o StrictHostKeyChecking=yes $Remote "sudo python3 /home/admin/it-school-upload/deploy.py $($releaseInfo.id) /home/admin/it-school-upload/$($releaseInfo.id).tar.gz"
if ($LASTEXITCODE -ne 0) { throw 'Deployment failed; see rollback output' }
