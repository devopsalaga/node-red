/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

 var when = require("when");

var events = require("nr-test-utils").require("@node-red/runtime/lib/events.js");

var palette = require("./palette_page");
var nodeFactory = require("../nodes/nodefactory_page");

var flowLayout = {
    flowRightEnd : 600,
    widthInterval : 300,
    heightInterval : 80
};

var previousX = -flowLayout.widthInterval;
var previousY = 0;

function addNode(type, x, y) {
    if (x !== undefined) {
        previousX = x;
        if (y !== undefined) {
            previousY = y;
        }
    } else {
        if (previousX < flowLayout.flowRightEnd) {
            previousX = previousX + flowLayout.widthInterval;
        } else {
            previousX = 0;
            previousY = previousY + flowLayout.heightInterval;
        }
    }
    browser.moveToObject(palette.getId(type));
    browser.buttonDown();
    browser.moveToObject("#red-ui-palette-search", previousX + 300, previousY + 100); // adjust to the top-left corner of workspace.
    browser.buttonUp();
    // Last node is the one that has been created right now.
    var nodeElement = browser.elements('//*[@class="red-ui-flow-node red-ui-flow-node-group"][last()]');
    var nodeId = nodeElement.getAttribute('id');
    var node = nodeFactory.create(type, nodeId);
    return node;
}

function deleteAllNodes() {
    browser.click('.innerCanvas');
    browser.keys(['Control', 'a', 'a', 'Control']); // call twice to release the keys.
    browser.keys(['Delete']);
}

function deploy() {
    browser.call(function () {
        return when.promise(function(resolve, reject) {
            events.on("runtime-event", function(event) {
                if (event.id === 'runtime-deploy') {
                    resolve();
                }
            });
            browser.clickWithWait('#red-ui-header-button-deploy');
        });
    });
    browser.waitForText('#red-ui-header-button-deploy', 2000);
    // Need additional wait until buttons becomes clickable.
    browser.pause(50);
}

function init(width, height) {
    deleteAllNodes();

    if (width !== undefined) {
        flowLayout.widthInterval = width;
    }
    if (height !== undefined) {
        flowLayout.heightInterval = height;
    }
    previousX = -flowLayout.widthInterval;
    previousY = 0;
}

module.exports = {
    addNode: addNode,
    deploy: deploy,
    init: init
};
