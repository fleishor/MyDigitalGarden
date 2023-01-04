"use strict";

const fs = require("fs");

let nodes = [];
let links = [];
let graphData = [];

let rawdata = fs.readFileSync("db.json");
let myDigitalGarden = JSON.parse(rawdata);

var posts = myDigitalGarden.models.Post;
var nodePosts = posts.map((post) => { return {"id": post._id, "label": post.title}; });
nodes = nodes.concat(nodePosts);

var tags = myDigitalGarden.models.Tag;
var nodeTags = tags.map((tag) => { return {"id": tag._id, "label": "#"+tag.name}; });
nodes = nodes.concat(nodeTags);

graphData.push("const gData = {");
graphData.push("\"nodes\": [");
for (const node of nodes)
{
    graphData.push("{ \"id\": \"" + node.id + "\", \"label\": \"" + node.label + "\" } ,");
}
graphData.push("],");

var postTags = myDigitalGarden.models.PostTag;
var linkTags = postTags.map((postTag) => { return {"source": postTag.tag_id, "target": postTag.post_id}; });
links = links.concat(linkTags);

graphData.push("\"links\": [");
for (const link of links)
{
    graphData.push("{ \"source\": \"" + link.source + "\", \"target\": \"" + link.target + "\" } ,");
}
graphData.push("]");
graphData.push("};");

fs.writeFileSync("./source/digitalgarden/graphData.js", graphData.join(""))
