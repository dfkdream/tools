<script>
    import '../app.css';
    import { App } from 'konsta/svelte';
    import { pwaInfo } from 'virtual:pwa-info';

    $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
    {@html webManifestLink}
    <title>Tools</title>
</svelte:head>
  
<App theme="ios">
    <slot />
</App>