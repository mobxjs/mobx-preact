export function createTestRoot() {
    document.body.innerHTML = '';
    const testRoot = document.createElement('main');
    document.body.appendChild(testRoot);
    return testRoot;
}

export async function pause(time = 0) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

export function disabledTest(name, fn, reason) {
    console.info(`Test "${name}" is disabled because:\n${reason}`); // eslint-disable-line no-console
}