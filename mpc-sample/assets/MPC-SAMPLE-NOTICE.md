# MPC Sample device wordmark

MPC Sample is a trademark of inMusic Brands, Inc. The official outline/solid letter geometry is taken from the cover of the [MPC Sample User Guide v1.0](https://cdn.inmusicbrands.com/akai/sample/MPC%20Sample%20-%20User%20Guide%20-%20v1.0.pdf), linked by Akai's official support materials. Geometry is rendered white on black for hardware identification in this local development build.

Source PDF SHA-256: ce61f4ff09e0297f84254559b2532d58d66f6b3c863ba775fd2fc7adce824e5d.

Only wordmark vector paths are included; no manual pages, cover illustrations or proprietary firmware are bundled. The SVG retains inMusic's applicable copyright/trademark rights. It is separate from the CC0 RHYTHMER artwork and software licensing. No endorsement or official firmware status is asserted. Public redistribution rights are part of the remaining release review.

Reproduction: tools/import_device_mark.py INPUT_GUIDE.pdf assets/device/mpc-sample.svg, using pypdf. The renderer caches the vector commands as JUCE Paths and paints them directly into the destination Graphics at its actual scale. The mark is not baked into or enlarged from the pixel animation bitmap. No SVG/GUI library or downloaded font is added at runtime.
