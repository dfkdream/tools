<script lang="ts">
    import {
        Block,
        Navbar,
        NavbarBackLink,
        BlockTitle,
        BlockHeader,
        List,
        ListItem,
        Preloader,
        ListInput,
    } from "konsta/svelte";
    import { onMount } from "svelte";

    const timeFormat = new Intl.DateTimeFormat("default", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul",
    });

    const precipitationTypes: Record<string, string> = {
        "0": "강수없음",
        "1": "비",
        "2": "진눈깨비",
        "3": "눈",
        "5": "빗방울",
        "6": "빗방울눈날림",
        "7": "눈날림",
    };

    type Weather = {
        Time: Date;
        Temperature: string;
        Humidity: string;
        PrecipitationAmount: string;
        PrecipitationType: string;
        WindSpeed: string;
    };

    type Forecast = {
        ForecastTime: Date;
        Forecast: Weather[];
    };

    type location = {
        X: number;
        Y: number;
    };

    let locations: Record<string, location> = {
        화원명곡체육공원: { X: 87, Y: 89 },
        두류공원: { X: 88, Y: 90 },
    };

    let currentLocationName: string | null = null;
    let currentLocation: location | null = null;

    let observation: Weather | null = null;
    let forecast: Forecast | null = null;

    function fetchWeatherData(x: number, y: number) {
        observation = null;
        forecast = null;

        fetch(
            `https://api.tools.dfkdream.dev/weather/observation-${x}-${y}.json`,
        )
            .then((resp) => resp.json())
            .then((json: Weather) => {
                json.Time = new Date(json.Time);
                observation = json;
            });

        fetch(`https://api.tools.dfkdream.dev/weather/forecast-${x}-${y}.json`)
            .then((resp) => resp.json())
            .then((json: Forecast) => {
                json.ForecastTime = new Date(json.ForecastTime);
                json.Forecast = json.Forecast.map((v) => {
                    v.Time = new Date(v.Time);
                    return v;
                });
                forecast = json;
            });
    }

    onMount(() => {
        currentLocationName =
            localStorage.getItem("weather.location") || "화원명곡체육공원";
    });

    $: (() => {
        if (!currentLocationName) return;
        currentLocation = locations[currentLocationName];
    })();

    $: currentLocation &&
        fetchWeatherData(currentLocation.X, currentLocation.Y);
</script>

<Navbar title="날씨">
    <NavbarBackLink
        slot="left"
        text="Tools"
        onClick={() => {
            history.back();
        }}
    />
</Navbar>

<List strong inset>
    <ListInput
        label="위치"
        type="select"
        dropdown
        bind:value={currentLocationName}
        onChange={() => {
            if (!currentLocationName) return;
            localStorage.setItem("weather.location", currentLocationName);
        }}
    >
        {#each Object.keys(locations) as location}
            <option value={location}>{location}</option>
        {/each}
    </ListInput>
</List>

<BlockTitle>현재 날씨</BlockTitle>
{#if observation == null}
    <Block strong inset class="text-center">
        <Preloader size="w-8 h-8" />
    </Block>
{:else}
    <List
        strong
        inset
        colors={observation.PrecipitationType == "0"
            ? { strongBgIos: "bg-green-200" }
            : {}}
    >
        <ListItem
            title="강수량"
            after={observation.PrecipitationAmount + "mm"}
        />
        <ListItem
            title="강수형태"
            after={precipitationTypes[observation.PrecipitationType]}
        />
        <ListItem title="온도" after={observation.Temperature + "°C"} />
        <ListItem title="습도" after={observation.Humidity + "%"} />
        <ListItem title="풍속" after={observation.WindSpeed + "m/s"} />
    </List>
{/if}

<BlockTitle>초단기예보</BlockTitle>
{#if forecast == null}
    <Block strong inset class="text-center">
        <Preloader size="w-8 h-8" />
    </Block>
{:else}
    {#each forecast.Forecast as weather}
        <BlockHeader>{timeFormat.format(weather.Time)}</BlockHeader>
        <List
            strong
            inset
            colors={weather.PrecipitationType == "0"
                ? { strongBgIos: "bg-green-200" }
                : {}}
        >
            <ListItem title="강수량" after={weather.PrecipitationAmount} />
            <ListItem
                title="강수형태"
                after={precipitationTypes[weather.PrecipitationType]}
            />
            <ListItem title="온도" after={weather.Temperature + "°C"} />
            <ListItem title="습도" after={weather.Humidity + "%"} />
            <ListItem title="풍속" after={weather.WindSpeed + "m/s"} />
        </List>
    {/each}
{/if}

{#if observation != null || forecast != null}
    <BlockTitle>정보</BlockTitle>
    <List strong inset>
        {#if observation != null}
            <ListItem
                title="현재 날씨 발표시각"
                after={timeFormat.format(observation.Time)}
            />
        {/if}
        {#if forecast != null}
            <ListItem
                title="초단기예보 발표시각"
                after={timeFormat.format(forecast.ForecastTime)}
            />
        {/if}
    </List>
{/if}
