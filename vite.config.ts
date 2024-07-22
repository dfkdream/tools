import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import basicSSL from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	server: {
		proxy: {}
	},
	plugins: [
		sveltekit(),
		SvelteKitPWA(),
		basicSSL({
			name: "tools-dfkdream-dev"
		})
	]
});
