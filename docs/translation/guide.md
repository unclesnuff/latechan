# Translation

## Procedure

To add a new translation, "fork" the repository (or several repositories), "clone" it (or them) to your disk, create/edit the files, and then create a "pull request" (or several "pull requests"). See the official [guide](https://guides.github.com/activities/forking/).

## Messages

"Messages" are spread out across two repositories: [`captchan`](https://github.com/catamphetamine/captchan/tree/master/src/messages) and [`webapp-frontend`](https://github.com/catamphetamine/webapp-frontend/tree/master/src/messages). The file name is `<language>.json`.

Translating both `<language>.json` files is required. If some of the "messages" inside the files are missing, they'll be substituted by English ones.

"Messages" from `webapp-frontend` are ["deeply" merged](https://medium.com/@qjli/daily-coding-tips-14-how-to-do-deep-merge-in-javascript-30ab0845ad19) with "messages" from `captchan`.

## Offensive

"Offensive" words can be put inside "spoilers" to hide them (by default) when reading comments. The lists of "offensive" word "patterns" are called [`offensive.<language>.json`](https://github.com/catamphetamine/webapp-frontend/blob/master/src/messages/offensive.en.json) and located in [`webapp-frontend/src/messages`](https://github.com/catamphetamine/webapp-frontend/blob/master/src/messages/).

The lists of "offensive" words are meant only for really "bad" insults and should not include light insults used commonly in everyday life (for example, "shit" is not considered a "bad"-enough insult). This is a compromise between a user having unpleasant experience when reading such comments and having a really boring experience reading through dull, uninteresting and overly sterile half-spoilered comments.

## Countries

Country names are used as tooltips for country flags on boards like `/int/`. Translating country names is not required (English country names are used by default).

To add translated country names, create a file called [`countries.<language>.json`](https://github.com/catamphetamine/webapp-frontend/blob/master/src/messages/countries.en.json) in [`webapp-frontend/src/messages`](https://github.com/catamphetamine/webapp-frontend/blob/master/src/messages/).

Country names can be copy-pasted from [`github.com/umpirsky/country-list`](https://github.com/umpirsky/country-list/blob/master/data/).

```js
JSON.stringify(
  Object.keys(countries).sort()
    .reduce((all, country) => ({ ...all, [country]: countries[country] }), {}),
  null,
  '\t'
)
````