<script>
    import { Block, Navbar, Page, NavbarBackLink, BlockTitle, BlockHeader, List, ListItem, Preloader } from 'konsta/svelte';
    import { onMount } from 'svelte';

    const timeFormat = new Intl.DateTimeFormat([], {dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Seoul'});

    const precipitationTypes = {
        "0": "강수없음",
        "1": "비",
        "2": "진눈깨비",
        "3": "눈",
        "5": "빗방울",
        "6": "빗방울눈날림",
        "7": "눈날림"
    };

    let observation = null;
    let forecast = null;

    onMount(()=>{
        fetch("https://api.tools.dfkdream.dev/weather/observation.json")
        .then(resp=>resp.json())
        .then(json=>{observation=json})

        fetch("https://api.tools.dfkdream.dev/weather/forecast.json")
        .then(resp=>resp.json())
        .then(json=>{forecast=json})
    });

</script>

<Page>
    <Navbar title="날씨" translucent={false}>
        <NavbarBackLink slot="left" text="Tools" onClick={()=>{history.back()}} />
    </Navbar>

    <BlockTitle>현재 날씨</BlockTitle>
    {#if observation==null}
    <Block strong inset class="text-center">
        <Preloader size="w-8 h-8" />
    </Block>
    {:else}
    <List strong inset colors={observation.PrecipitationType=="0" ? {strongBgIos: "bg-green-200"} : {}}>
        <ListItem title="강수량" after={observation.PrecipitationAmount+"mm"} />
        <ListItem title="강수형태" after={precipitationTypes[observation.PrecipitationType]} />
        <ListItem title="온도" after={observation.Temperature+"°C"} />
        <ListItem title="습도" after={observation.Humidity+"%"} />
        <ListItem title="풍속" after={observation.WindSpeed+"m/s"} />
    </List>
    {/if}

    <BlockTitle>초단기예보</BlockTitle>
    {#if forecast==null}
    <Block strong inset class="text-center">
        <Preloader size="w-8 h-8" />
    </Block>
    {:else}
    {#each forecast.Forecast as weather}
    <BlockHeader>{timeFormat.format(new Date(weather.Time))}</BlockHeader>
    <List strong inset colors={weather.PrecipitationType=="0" ? {strongBgIos: "bg-green-200"} : {}}>
        <ListItem title="강수량" after={weather.PrecipitationAmount} />
        <ListItem title="강수형태" after={precipitationTypes[weather.PrecipitationType]} />
        <ListItem title="온도" after={weather.Temperature+"°C"} />
        <ListItem title="습도" after={weather.Humidity+"%"} />
        <ListItem title="풍속" after={weather.WindSpeed+"m/s"} />
    </List>
    {/each}
    {/if}

    {#if observation!=null || forecast!=null }
    <BlockTitle>정보</BlockTitle>
    <List strong inset>
        {#if observation!=null}
        <ListItem title="현재 날씨 발표시각" after={timeFormat.format(new Date(observation.Time))} />
        {/if}
        {#if forecast!=null}
        <ListItem title="초단기예보 발표시각" after={timeFormat.format(new Date(forecast.ForecastTime))} />
        {/if}
    </List>
    {/if}
</Page>