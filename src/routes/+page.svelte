<script>
    import { Navbar, List, ListItem } from 'konsta/svelte';
</script>

<Navbar title="Tools" translucent={false} />

<List strong inset>
    <ListItem href="/weather" title="날씨" />
    <ListItem href="/tuner" title="튜너" />
</List>