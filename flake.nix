{
  description = "AI-Interview development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem = f:
        nixpkgs.lib.genAttrs supportedSystems (system:
          f {
            pkgs = import nixpkgs { inherit system; };
          });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            # Prisma NixOS fix: cung cấp schema-engine binary thay vì để Prisma
            # tự download (sẽ fail vì không có bản linux-nixos trên CDN của Prisma)
            prisma-engines
          ];

          env = {
            # Trỏ Prisma CLI đến schema-engine được build bởi nixpkgs
            PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
            # Bỏ qua lỗi checksum khi Prisma không tìm thấy engine trên CDN
            PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1";
          };

          shellHook = ''
            echo "🚀 AI-Interview Nix DevShell activated (Node $(node -v), pnpm $(pnpm -v))"
            echo "🗄️  Prisma schema-engine: $PRISMA_SCHEMA_ENGINE_BINARY"
          '';
        };
      });
    };
}
