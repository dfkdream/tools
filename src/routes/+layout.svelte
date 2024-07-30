<script>
    import '../app.css';
    import { App, Page, BlockFooter } from 'konsta/svelte';
    import { PUBLIC_GITHUB_SHA } from '$env/static/public';
    import { pwaInfo } from 'virtual:pwa-info';

    $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
    {@html webManifestLink}
    <title>Tools</title>
</svelte:head>
  
<App theme="ios">
    <Page>
        <slot />

        <BlockFooter class="justify-center text-gray-400 dark:text-gray-600">
            Commit
            &nbsp;
            <a href={`https://github.com/dfkdream/tools/commit/${PUBLIC_GITHUB_SHA}`}>{PUBLIC_GITHUB_SHA.slice(0,7)}</a> 
        </BlockFooter>
    </Page>
</App>