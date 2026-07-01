async function test() {
  const r = await fetch("https://api.quran.gading.dev/surah/1");
  const data = await r.json();
  console.log(JSON.stringify(data.data.verses[0], null, 2));
}
test();
