<script lang="ts">
    import {
        Navbar,
        NavbarBackLink,
        List,
        ListItem,
        Block,
        BlockTitle,
        Badge,
        ListInput,
        Segmented,
        SegmentedButton,
        Button,
    } from "konsta/svelte";
    import { onDestroy, onMount } from "svelte";

    import { Tuner } from "./tuner";
    import type { TunerConfig } from "./tuner";

    let volume = 0;
    let freq = 0;
    let assessedString = "None";
    let inputAvailable = false;

    let tuner: Tuner | undefined = undefined;

    let WaveformCanvas: HTMLCanvasElement;
    let waveformCanvasCtx: CanvasRenderingContext2D;

    let activeSetting = 0;

    const defaultTunerConfig: TunerConfig = {
        gain: 2,
        fftsize: 2048,
        rmsMinimum: 0.008,
        rmsAttackThreshold: 0.006,
        attackDelay: 150,
        assessmentDuration: 250,
        strings: {
            E2: 82.4069,
            A2: 110,
            D3: 146.832,
            G3: 195.998,
            B3: 246.932,
            E4: 329.628,
        },
        bandpassFrequency: 206.01745,
        bandpassQ: 0.7,
    };

    let currentTunerConfig = structuredClone(defaultTunerConfig);

    let tunerConfig = structuredClone(defaultTunerConfig);

    function visualizeCallback(data: Float32Array, rms: number) {
        volume = rms;
        inputAvailable = rms > tunerConfig.rmsMinimum;

        waveformCanvasCtx.clearRect(0, 0, tunerConfig.fftsize, 128);

        waveformCanvasCtx.strokeStyle = "red";
        waveformCanvasCtx.setLineDash([5, 2]);
        waveformCanvasCtx.beginPath();
        waveformCanvasCtx.moveTo(0, 128 / 2);
        waveformCanvasCtx.lineTo(data.length - 1, 128 / 2);
        waveformCanvasCtx.stroke();

        waveformCanvasCtx.strokeStyle = "black";
        waveformCanvasCtx.setLineDash([]);
        waveformCanvasCtx.beginPath();
        waveformCanvasCtx.moveTo(0, data[0] * 100 + 128 / 2);
        for (let i = 1; i < data.length; i++) {
            waveformCanvasCtx.lineTo(i, data[i] * 100 + 128 / 2);
        }
        waveformCanvasCtx.stroke();
    }

    function resultCallback(stringName: string, frequency: number) {
        assessedString = `${stringName} (${currentTunerConfig.strings[stringName]} Hz)`;
        freq = frequency;
    }

    function visibilityChangeHandler() {
        if (document.hidden) {
            tuner?.detatchMicrophone();
        } else {
            tuner?.attachMicrophone();
        }
    }

    onMount(() => {
        let ctx = WaveformCanvas.getContext("2d");
        if (!ctx) {
            alert("Failed to load canvas context");
            return;
        }

        waveformCanvasCtx = ctx;

        tuner = new Tuner(tunerConfig, visualizeCallback, resultCallback);

        document.addEventListener("visibilitychange", visibilityChangeHandler);
    });

    onDestroy(() => {
        document.removeEventListener(
            "visibilitychange",
            visibilityChangeHandler,
        );
        tuner?.detatchMicrophone();
    });
</script>

<Navbar title="튜너">
    <NavbarBackLink
        slot="left"
        text="Tools"
        onClick={() => {
            history.back();
        }}
    />
</Navbar>

<List strong inset>
    <ListItem title="RMS">
        <Badge
            slot="after"
            colors={inputAvailable
                ? { bg: "bg-blue-500" }
                : { bg: "bg-neutral-500" }}
        >
            {(volume * 100).toFixed(2) + "%"}
        </Badge>
    </ListItem>
    <ListItem title="Assessed String" after={assessedString} />
    <ListItem title="Frequency" after={freq.toFixed(2) + " Hz"} />
</List>

<BlockTitle>Visualization</BlockTitle>
<Block strong inset>
    <canvas
        bind:this={WaveformCanvas}
        width={tunerConfig.fftsize - 1}
        height="128"
        class="w-full"
    />
</Block>

<BlockTitle>Configurations</BlockTitle>
<Block strong inset>
    <Segmented strong>
        <SegmentedButton
            strong
            active={activeSetting == 0}
            onClick={() => {
                activeSetting = 0;
            }}>Strings</SegmentedButton
        >
        <SegmentedButton
            strong
            active={activeSetting == 1}
            onClick={() => {
                activeSetting = 1;
            }}>Advanced</SegmentedButton
        >
    </Segmented>

    {#if activeSetting == 0}
        <List class="!my-3">
            {#each Object.keys(tunerConfig.strings) as string}
                <ListInput
                    label={string}
                    type="number"
                    bind:value={tunerConfig.strings[string]}
                />
            {/each}
        </List>
    {:else}
        <List class="!my-3">
            <ListInput
                label="Gain"
                type="number"
                bind:value={tunerConfig.gain}
            />
            <ListInput
                label="Minimum RMS"
                type="number"
                bind:value={tunerConfig.rmsMinimum}
            />
            <ListInput
                label="Attack RMS"
                type="number"
                bind:value={tunerConfig.rmsAttackThreshold}
            />
            <ListInput
                label="Attack Delay"
                type="number"
                bind:value={tunerConfig.attackDelay}
            />
            <ListInput
                label="Assessment Duration"
                type="number"
                bind:value={tunerConfig.assessmentDuration}
            />
            <ListInput
                label="Bandpass Frequency"
                type="number"
                bind:value={tunerConfig.bandpassFrequency}
            />
            <ListInput
                label="Bandpass Q"
                type="number"
                bind:value={tunerConfig.bandpassQ}
            />
        </List>
    {/if}

    <div class="grid grid-cols-2 gap-x-4">
        <Button
            onClick={() => {
                tuner?.detatchMicrophone();

                currentTunerConfig = structuredClone(tunerConfig);

                tuner = new Tuner(
                    tunerConfig,
                    visualizeCallback,
                    resultCallback,
                );
            }}>Apply</Button
        >
        <Button
            class="bg-red-500"
            onClick={() => {
                tunerConfig = structuredClone(defaultTunerConfig);
            }}>Reset</Button
        >
    </div>
</Block>
