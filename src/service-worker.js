import { build, files, version } from '$service-worker';
import { precacheAndRoute, precache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

precacheAndRoute([
    ...build.map(f => {
        return {
            url: f,
            revision: null
        }
    }),
    ...files.map(f => {
        return {
            url: f,
            revision: `${version}`
        }
    })
]);

const skRoutes = ["/", "/weather/"];

precache(skRoutes.map(f => {
    return {
        url: f,
        revision: `${version}`
    }
}));

const matchCb = ({ url, request, event }) => {
    return skRoutes.some(path => url.pathname === path);
};
registerRoute(matchCb, new StaleWhileRevalidate({}));