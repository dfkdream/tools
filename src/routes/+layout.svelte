<script>
    import '../app.css';
    import { App } from 'konsta/svelte';
    import { onMount } from 'svelte';
    import { pwaInfo } from 'virtual:pwa-info';

    $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

    onMount(async ()=>{
        if (pwaInfo){
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({
                immediate: true,
            });
        }
    });
</script>

<svelte:head>
    {@html webManifestLink}
    <title>Tools</title>
</svelte:head>
  
<App theme="ios">
    <slot />
</App>