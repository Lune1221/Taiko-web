class EasySettings {
  constructor(...args) {
    this.init(...args);
  }

  init() {
    this.items = [

{
  key: "songSelectingSpeed",
  title: () => strings.songSelectingSpeed,
  info: "曲選択速度を入力してね！\n0 = 高速\n400 = 初期値\n800 = ゆっくり\n変えすぎると固まります注意してください。",
  empty: 400,
  reload: true,
},
{
  key: "baisoku",
  title: () => strings.baisoku,
  info: "ばいそく(HS)の倍率を入力してね！\n2 = ばいそく\n3 = さいばい\n4 = よんばい\n1ではない場合、スコアは保存されません。",
  empty: 1,
  reload: false,
},
{
  key: "doron",
  title: () => strings.doron,
  info: "ドロンを有効にするには\"1\"を入力してね！\n0または空文字でリセットできます！",
  empty: 0,
  reload: false,
},
{
  key: "abekobe",
  title: () => strings.abekobe,
  info: "あべこべを有効にするには\"1\"を入力してね！\n0または空文字でリセットできます！",
  empty: 0,
  reload: false,
},
{
  key: "detarame",
  title: () => strings.detarame,
  info: "でたらめになる確率をパーセントで入力してね！(0〜100)\n20 = きまぐれ\n50 = でたらめ",
  empty: 0,
  reload: false,
},
{
  key: "titleSort",
  title: () => strings.titlesort,
  info: "タイトル順で並べ替えするには\"1\"を入力してね！\n0か空文字でリセットできます。",
  empty: 0,
  reload: true,
},
{
  key: "playbackRate",
  title: () => strings.playbackRate,
  info: "音楽の速度を入力してね！\n0.8 = ゆっくり\n1 = 初期値\n1.25 = Nightcoreみたいな\n1では無い場合スコアは保存されません。",
  empty: 1,
  reload: false,
},
{
  key: "circleChaosMode",
  title: () => strings.circleChaosMode,
  info: "円形カオスモードを有効にするには\"1\"を入力してね！\n0または空文字でリセットできます！",
  empty: 0,
  reload: false,
},
{
  key: "progressBar",
  title: () => strings.progressBar,
  info: "進捗バーを表示するには1を入力してね！\n0 = 非表示\n1 = 表示",
  empty: 1,
  reload: false,
},
{
  key: "colorOfProgressBar",
  title: () => strings.colorOfProgressBar,
  info: "進捗バーの色を入力してね！\n0x<色コード>で指定できます！\n0x000000 = 黒\n0xff0000 = 赤\n0x00ff00 = 緑\n0x0000ff = 青\n0xffffff = 白",
  empty: 0xffffff,
  reload: false,
},
{
  key: "visualizer",
  title: () => strings.visualizer,
  info: "ビジュアライザーを有効にするには\"1\"を入力してね！\n0 = 非表示\n1 = 表示",
  empty: 1,
  reload: false,
},
{
  key: "heightOfVisualizer",
  title: () => strings.heightOfVisualizer,
  info: "ビジュアライザーの高さを入力してね！",
  empty: 4,
  reload: false,
},
{
  key: "colorOfVisualizer",
  title: () => strings.colorOfVisualizer,
  info: "ビジュアライザーの色を入力してね！\n0x000000 = 黒\n0xff0000 = 赤\n0x00ff00 = 緑\n0x0000ff = 青\n0xffffff = 白",
  empty: 0xffffff,
  reload: false,
},
{
  key: "fftSize",
  title: () => strings.fftSize,
  info: "音声解析で使用するFFTのサイズを入力してね！(32/64/128/256/512/1024/2048/4096/8192/16384/32768)\n大きいほど正確になりますが、重くなります。",
  empty: 256,
  reload: false,
},

];
  }

  asSongItems(skin) {
    return this.items.map((item) => {
      return {
        title: item.title(),
        skin,
        action: item.key,
      };
    });
  }

  keys() {
    return this.items.map((i) => i.key);
  }

  first(key) {
    return this.items.find((i) => i.key === key);
  }

  get(key) {
    const keyLower = key.toLowerCase();
    const value =  window.localStorage.getItem(keyLower);
    return value !== null ? Number(value) : this.first(key).empty;
  }

  set(key, value) {
    const keyLower = key.toLowerCase();
    window.localStorage.setItem(keyLower, value.toString());
  }

  launchEditor(key) {
    if (!window.confirm(`🌲 ${this.first(key).title()} を編集しようとしています 🌲\n⚠️ これらの設定の変更は簡単ですが、時に破壊的であり、上級者向けに設計されています ⚠️\n📝 もし、バグが発生した場合は、このサイトのローカルストレージを削除することでリセットできます 📝`)) {
      return;
    }

    const from = this.get(key).toString();

    var to = window.prompt(this.first(key).info, from);

    if (to === null) {
      // キャンセル
      return;
    } else if (to === "") {
      // 空文字でリセット
      to = this.first(key).empty.toString();
    }

    if (from === to) {
      // 変更なし
      return;
    }

    this.set(key, to);
    window.alert("正常に変更できました✨");

    if (this.first(key).reload) {
      window.alert("設定を反映するためにリロードを開始します。");
      window.location.reload();
    }
  }

  isEdited(key) {
    return this.get(key) !== this.first(key).empty;
  }
}
