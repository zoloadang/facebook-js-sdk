/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * 包含公共方法 FB.Insights.impression ，用于分析像素
 *
 * @provides fb.insights
 * @requires fb.prelude
 */

/**
 * 分析像素。如果你不确信整合的Facebook能够为你的应用提供的潜力，你可以使用轻量级的可视化数据工具
 * 收集一些信息。
 * TODO: 在哪里看这个数据？
 *
 * @class FB.Insights
 * @static
 * @access private
 */
FB.provide('Insights', {
  /**
   * This method should be called once by each page where you want to track
   * impressions.
   *
   *     FB.Insights.impression(
   *       {
   *         api_key: 'API_KEY',
   *         lid: 'EVENT_TYPE'
   *       }
   *     );
   *
   * @access private
   * @param params {Object} parameters for the impression
   * @param cb {Function} optional - called with the result of the action
   */
  impression: function(params, cb) {
    // 没有http 或者 https 那么浏览器就会使用当前页面所使用的协议
    // 参考 http://www.faqs.org/rfcs/rfc1808.html
    var g = FB.guid(),
        u = "//ah8.facebook.com/impression.php/" + g + "/",
        i = new Image(1, 1),
        s = [];

    if (!params.api_key && FB._apiKey) {
      params.api_key = FB._apiKey;
    }
    for (var k in params) {
      s.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    }

    u += '?' + s.join('&');
    if (cb) {
      i.onload = cb;
    }
    i.src = u;
  }
});

