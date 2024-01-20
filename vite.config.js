import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
		alias: {
			"@": path.resolve(path.resolve(), "./src"),
			$lib: path.resolve("./src/lib"),
			$stores: path.resolve("@/src/stores"),
			$utils: path.resolve("@/src/utilities")
		}
	},
})
