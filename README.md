# purge (prg)

<p align="center">
  <strong>purge</strong> (<code>prg</code>) is a simple command‑line uninstaller for macOS applications.
</p>

## 📜 Overview

`prg` automates removal of an app bundle and all its associated files—preferences, caches, support files, receipts, and more—by parsing the app’s metadata and scanning known system directories. Think of it as a drag‑and‑drop uninstaller in your terminal.

## 🚀 Features

* **Bundle metadata parsing**: Extracts `CFBundleIdentifier` and `CFBundleName` from the app’s `Info.plist`.
* **Targeted scan paths**: Searches only standard macOS locations (`~/Library/Preferences`, `~/Library/Caches`, `/var/db/receipts`, etc.) for speed and accuracy.
* **Interactive selection**: Presents an interactive checklist so you can choose which files to keep or delete.
* **Dry‑run support**: Preview all candidate files without actually trashing them (coming soon!).
* **Single‑file binary**: Delivered as a self‑contained executable via `bun build --compile`, no Bun runtime required on target machines.

## 📥 Installation

### Homebrew

```bash
# If you maintain your own tap:
brew tap wess/packages
brew install purge
```

### Manual build

```bash
# Clone the repo
git clone https://github.com/wess/purge.git
cd purge

# Install dependencies and build (macOS x64 + arm64)
npm install
npm run build:mac

# Link the binary
tln -sf "$(pwd)/dist/prg-macos-$(uname -m)" /usr/local/bin/prg
```

## 💡 Usage

Run `prg` followed by one or more `.app` bundle paths:

```bash
$ prg /Applications/SomeApp.app
```

You’ll see a checklist of all related files. Uncheck items to keep them; press Enter to trash the rest.

### Common options

- `-n, --dry-run`  Preview candidate files without deleting.
- `-h, --help`    Show usage information.

## 🛠️ Development

- **Source**: https://github.com/wess/purge
- **Issues & PRs**: welcome!

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

♥ [Sponsor this project](https://github.com/sponsors/wess)
