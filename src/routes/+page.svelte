<script>
    import { Navbar, Page, List, ListItem } from 'konsta/svelte';
</script>

<Page>
    <Navbar title="Tools" translucent={false} />

    <List strong inset>
        <ListItem href="/weather" title="날씨" />
        <ListItem href="/tuner" title="튜너" />
    </List>
</Page>
