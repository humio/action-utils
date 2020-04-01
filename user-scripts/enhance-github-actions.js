// ==UserScript==
// @name         Enhance GitHub Actions
// @author       Simon Boisen <simon@humio.com>
// @version      1.0.0
// @match        https://github.com/humio/humio/actions*
// @updateURL    https://raw.githubusercontent.com/humio/action-utils/master/user-scripts/enhance-github-actions.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const checkSuites = document.querySelectorAll("div[data-channel^='check_suites:']");

  for(const cs of checkSuites) {
    if(cs.querySelector(".d-block > .text-bold").innerText == "CI") {

      if(cs.querySelector("svg.octicon.text-green")) {
        const branchName = cs.querySelector("a.branch-name").innerText;

        addDivider(cs);


        if(/master|1\.\d+-release/.test(branchName)) {
          addPushVersionItem(cs);
        }

        addDeployItem(cs);
      }
    }
  }
})();

function addDivider(checkSuiteElement) {
  const workflowRunId = checkSuiteElement.querySelector("a[href^='/humio/humio/actions/runs/']").href.match(/\d+/)[0];

  const li = checkSuiteElement.querySelector("ul.dropdown-menu > li:last-child").cloneNode()
  li.role = "none"
  li.className = "dropdown-divider";
  console.log(li);

  checkSuiteElement.querySelector("ul.dropdown-menu").prepend(li);
}

function addDeployItem(checkSuiteElement) {
  addDropDownElement(checkSuiteElement, id => `https://ci.humio.com/job/deploy/parambuild/?GH_RUN_ID=${id}`, "Deploy via Jenkins");
}

function addPushVersionItem(checkSuiteElement) {
  addDropDownElement(checkSuiteElement, (id, sha) => `https://ci.humio.com/job/push-version/parambuild/?GH_RUN_ID=${id}&GIT_SHA=${sha}`, "Push version via Jenkins");
}

function addDropDownElement(checkSuiteElement, targetUrlMaker, linkText) {
  const workflowRunId = checkSuiteElement.querySelector("a[href^='/humio/humio/actions/runs/']").href.match(/\d+/)[0];
  const sha = (() => {
    const a = checkSuiteElement.querySelector("a[href^='/humio/humio/commit/'");
    if(a) {
      return a.href.match(/commit\/(.+)/)[1];
    }
  })();

  const targetUrl = targetUrlMaker(workflowRunId, sha)
  const li = checkSuiteElement.querySelector("ul.dropdown-menu > li:last-child").cloneNode(true);

  const a = li.querySelector("a");
  a.href = targetUrl;
  a.innerText = linkText;
  checkSuiteElement.querySelector("ul.dropdown-menu").prepend(li);
}
