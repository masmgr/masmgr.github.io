# SonarQube とは

静的コード解析ツール

https://www.sonarqube.org/

コミュニティ版と有償の開発版が存在する。

C#, Javascript, Typescript, css, html などの静的解析に対応している。(https://www.sonarqube.org/features/multi-languages/)

- バグの検出
- 怪しいコード(Code Smells)の検出
- 重複コードの検出
- 複雑度の検出
- セキュリティ上脆弱なコードの検出
ができる。
ルール詳細(https://rules.sonarsource.com/)

開発版は解析対象のコード行数に応じて従量課金

https://www.sonarqube.org/trial-request/developer-edition/

# Gitlabとの連携について
Community版では、1プロジェクトにつき1ブランチしか解析できず、マージリクエストされたブランチを解析することはできない。

https://www.sonarqube.org/developer-edition/

行う場合は有償版の購入が必要になる。

コミュニティ版プラグインが存在するが、サポート対象外。

# Dockerでの利用

標準でdocker-composeが提供されているのでそちらを利用するのがよい。
https://github.com/SonarSource/docker-sonarqube

参考記事
- (SonarQubeサクッといじってみた)[https://qiita.com/yasumon/items/52702df02aaf6201bf30]
