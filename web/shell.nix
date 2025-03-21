{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
  ];

  shellHook = ''
    echo "Web development shell loaded with Node.js and pnpm."
    # Ensure localhost resolution
    export HOST=127.0.0.1
    pnpm install
  '';
}
