<script>
    import '../app.css';
    import { App } from 'konsta/svelte';
</script>

<svelte:head>
    <title>SvelteKit PWA</title>
</svelte:head>
  
<App theme="ios">
    <slot />
</App>