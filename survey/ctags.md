## ctags とは

ソースコードの名前のインデックスファイルを生成するプログラム。
エディタでインデックスファイルを元に関数、変数などを検索し、移動できる。

エディタで解析機能に対応していない場合もctagsで宣言場所に移動できる。

[ctags Wikipedia](https://ja.wikipedia.org/wiki/Ctags)

## Universal CTags

様々な言語に対応した Ctags生成ツール

[公式サイト](https://ctags.io/)

[Windowsバイナリ](https://github.com/universal-ctags/ctags-win32/releases)

Chocolatey でのインストール
```
choco install universal-ctags
```

## サクラエディタ

[タグジャンプ機能(ctags)](https://sakura-editor.github.io/help/HLP000278.html)

タグファイルというインデックス用のファイルを作成して、それを元に関数、変数の宣言位置にジャンプする機能

- タグファイルは手動更新が必要。
- 階層が深い場合は、フォルダごとにタグファイルを作成する必要がある。

コマンドラインでサクラエディタ用のタグファイルを生成するコマンド

```
ctags -n -R --input-encoding-asp=Shift_JIS --output-encoding=UTF-8
```

## Visual Studio Code

CTags Supportをインストールする
