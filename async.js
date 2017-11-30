'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    // асинхронная магия
    return new Promise(resolveProg => {
        const result = [];
        let startedCount = 0;

        function translate(jobIndex) {
            return new Promise ((resolve, reject) => {
                jobs[jobIndex]()
                    .then(resolve, reject);
                setTimeout(reject, timeout, new Error ('Promise timeout'));
            });
        }

        function start(jobIndex) {
            let final = res => finish(res, jobIndex);

            return translate(jobIndex)
                .then(final)
                .catch(final);
        }

        function finish(res, jobIndex) {
            result[jobIndex] = res;

            if (startedCount < jobs.length) {
                start(startedCount++);
            } else if (result.length === jobs.length) {
                resolveProg(result);

                return;
            }
        }

        if (jobs.length === 0) {
            resolveProg([]);

            return;
        }

        while (startedCount < parallelNum) {
            start(startedCount++);
        }
    });
}
