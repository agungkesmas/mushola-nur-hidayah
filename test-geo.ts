async function test() {
  const r = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
  console.log(await r.json());
}
test();
