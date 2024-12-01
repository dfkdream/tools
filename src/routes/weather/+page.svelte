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
        Badge,
    } from "konsta/svelte";
    import { onMount } from "svelte";
    import { PUBLIC_GITHUB_SHA } from "$env/static/public";

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

    function badgeColor(precipitationType: string) {
        switch (precipitationType) {
            case "0":
                return { bg: "bg-green-700" };
            default:
                return { bg: "bg-neutral-500" };
        }
    }

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

    let diff = 0;
    let diffLimit = new Date(Date.UTC(1970, 0, 1, 3)).getTime(); // 3 hours

    function fetchWeatherData(x: number, y: number) {
        observation = null;
        forecast = null;

        let now = new Date().getTime();

        fetch(
            `https://api.tools.dfkdream.dev/weather/observation-${x}-${y}.json`,
        )
            .then((resp) => resp.json())
            .then((json: Weather) => {
                json.Time = new Date(json.Time);
                diff = Math.max(diff, now - json.Time.getTime());
                observation = json;
            });

        fetch(`https://api.tools.dfkdream.dev/weather/forecast-${x}-${y}.json`)
            .then((resp) => resp.json())
            .then((json: Forecast) => {
                json.ForecastTime = new Date(json.ForecastTime);
                diff = Math.max(diff, now - json.ForecastTime.getTime());
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

    const issueReportSubject = "[tools-날씨] 오래된 날씨 데이터 오류";
    $: issueReportBody = encodeURIComponent(
        `(선택) 항목은 오류 확인에 도움을 주는 데이터입니다. 지우셔도 됩니다.\n\n` +
            `위치 (선택): ${currentLocationName}\n` +
            `발생시각 (선택): ${timeFormat.format(new Date())}\n` +
            `Commit: ${PUBLIC_GITHUB_SHA}`,
    );
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

{#if diff > diffLimit}
    <Block strong inset class="text-center">
        ⚠️ 날씨 데이터가 오래되었습니다. 새로고침 후에도 이 메시지가 사라지지
        않는다면
        <a
            href={`mailto:support@dfkdream.dev?subject=${issueReportSubject}&body=${issueReportBody}`}
        >
            support@dfkdream.dev
        </a>
        로 문의해 주세요.️ ⚠️
    </Block>
{/if}

<BlockTitle>현재 날씨</BlockTitle>
{#if observation == null}
    <Block strong inset class="text-center">
        <Preloader size="w-8 h-8" />
    </Block>
{:else}
    <List strong inset>
        <ListItem
            title="강수량"
            after={observation.PrecipitationAmount + "mm"}
        />
        <ListItem title="강수형태">
            <Badge
                slot="after"
                colors={badgeColor(observation.PrecipitationType)}
            >
                {precipitationTypes[observation.PrecipitationType]}
            </Badge>
        </ListItem>
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
        <List strong inset>
            <ListItem title="강수량" after={weather.PrecipitationAmount} />
            <ListItem title="강수형태">
                <Badge
                    slot="after"
                    colors={badgeColor(weather.PrecipitationType)}
                >
                    {precipitationTypes[weather.PrecipitationType]}
                </Badge>
            </ListItem>
            <ListItem title="온도" after={weather.Temperature + "°C"} />
            <ListItem title="습도" after={weather.Humidity + "%"} />
            <ListItem title="풍속" after={weather.WindSpeed + "m/s"} />
        </List>
    {/each}
{/if}

<BlockTitle>레이더 강수량</BlockTitle>
<Block strong inset>
    <img
        class="m-auto"
        src="https://api.tools.dfkdream.dev/weather/radar.png"
        alt="레이더 강수량"
    />
</Block>

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
