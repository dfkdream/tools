<script lang="ts">
    import { goto } from "$app/navigation";
    import {
        Navbar,
        NavbarBackLink,
        BlockTitle,
        List,
        ListItem,
        ListButton,
        Stepper,
    } from "konsta/svelte";
    import { onMount } from "svelte";

    let counters: Record<string, number> = {};

    function save() {
        localStorage.setItem("counters", JSON.stringify(counters));
    }

    function restore() {
        counters = JSON.parse(localStorage.getItem("counters") || "{}");
    }

    onMount(() => {
        restore();
    });
</script>

<Navbar title="카운터">
    <NavbarBackLink
        slot="left"
        text="tools"
        onClick={() => {
            goto("/");
        }}
    />
</Navbar>

{#each Object.keys(counters) as c}
    <BlockTitle>{c}</BlockTitle>
    <List strong inset>
        <ListItem title="Count">
            <Stepper
                slot="after"
                value={counters[c]}
                onPlus={() => {
                    counters[c]++;
                    save();
                }}
                onMinus={() => {
                    counters[c]--;
                    save();
                }}
            />
        </ListItem>
        <ListButton
            onClick={() => {
                if (confirm("Are you sure?")) {
                    counters[c] = 0;
                    save();
                }
            }}
        >
            Reset
        </ListButton>
        <ListButton
            onClick={() => {
                if (confirm("Are you sure?")) {
                    delete counters[c];
                    save();
                    restore();
                }
            }}
        >
            Remove
        </ListButton>
    </List>
{/each}

<List strong inset>
    <ListButton
        onClick={() => {
            let name = prompt("Enter counter name");
            if (!name) return;

            if (counters[name] != undefined) {
                alert("Name already exists. Try again.");
                return;
            }

            counters[name] = 0;
            save();
        }}
    >
        Add Counter
    </ListButton>
</List>
