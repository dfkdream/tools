<script>
    import { Navbar, Page, List, ListItem, BlockFooter } from 'konsta/svelte';
    import { PUBLIC_GITHUB_SHA } from '$env/static/public';
</script>

<Page>
    <Navbar title="Tools" translucent={false} />

    <List strong inset>
        <ListItem href="/weather" title="날씨" />
        <ListItem href="/tuner" title="튜너" />
    </List>


    <BlockFooter class="justify-center text-gray-400 dark:text-gray-600">
        Commit
        &nbsp;
        <a href={`https://github.com/dfkdream/tools/commit/${PUBLIC_GITHUB_SHA}`}>{PUBLIC_GITHUB_SHA.slice(0,7)}</a> 
    </BlockFooter>
</Page>
