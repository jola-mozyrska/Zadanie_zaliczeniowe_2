import { WebDriver } from 'selenium-webdriver';
import { driver } from 'mocha-webdriver';
import { expect } from 'chai';

const URL = "http://127.0.0.1:1960"

async function loginUser1(driver: WebDriver) {
    await driver.get(URL + "/login");
    await driver.find('input[name=login]').doSendKeys("user1");
    await driver.find('input[name=passwd]').doSendKeys("user1");
    await driver.find('#submitButton').click();
}

async function checkIfLogged(driver: WebDriver) {
    await driver.get(URL + "/change_passwd");
    const page = await driver.getCurrentUrl();
    console.log("page:", page, "expected:", URL + "/change_passwd");
    return page === URL + "/change_passwd";
}

async function checkIfResults(driver: WebDriver) {
    const page = await driver.getCurrentUrl();
    return page.startsWith(URL + "/user_stats/");
}

async function changePasswd(driver: WebDriver, oldPass: string, newPass: string) {
    await driver.get(URL + "/change_passwd");
    await driver.find('input[name=old_passwd]').sendKeys(oldPass);
    await driver.find('input[name=new_passwd]').sendKeys(newPass);
    await driver.find('#submitButton').click();
}

describe("check logging in", () => {
    it("should logout ", async () => {
        console.log("First login");
        await loginUser1(driver);
        await driver.sleep(50);
        const cookiesList = await driver.manage().getCookies();
        await driver.manage().deleteAllCookies();
        console.log(cookiesList);
        console.log("Second login");
        await loginUser1(driver);
        await driver.sleep(50);
        console.log("Changing password");
        await changePasswd(driver, "user1", "user1");

        await driver.get(URL);
        for (const cookie of cookiesList) {
            await driver.manage().addCookie(cookie);
        }

        console.log("Cookies restored");
        expect(await checkIfLogged(driver)).to.equal(false);

    }).timeout(500000);

    it("should be logged in", async () => {
        console.log("First login");
        await loginUser1(driver);
        console.log("Second login");
        await loginUser1(driver);
        console.log("Changing password");
        await changePasswd(driver, "user1", "user1");

        expect(await checkIfLogged(driver)).to.equal(true);

    }).timeout(500000);
})

describe("check solving quiz", () => {
    it("check timer", async () => {
        await loginUser1(driver);
        await driver.find('.menu').click();
        await driver.find('.quizname').click();
        await driver.find('.startquiz').click();
        await driver.find('.start_button').click();

        let click = 0;
        for(let i = 1; i <= 4; ++i) {
            await driver.sleep(400 * i - click);
            await driver.find('.answer').sendKeys('1');
            if(i <= 3) {
                const answeredTime = Date.now();
                await driver.find('a.right_arrow').click();
                click = Date.now() - answeredTime;
            }
        }

        await driver.find('button.end_quiz_button').click();
        expect(await checkIfResults(driver)).to.equal(true);
        //  quiz done

        const savedTimes = [];
        let sumSavedTimes = 0;
        for(let i = 1; i <= 4; ++i) {
            savedTimes.push(parseInt (await driver.find(`.table > tbody:nth-child(2) > tr:nth-child(${i}) > th:nth-child(5)`).getText(), 10));
            sumSavedTimes += savedTimes[i - 1];
        }
        console.log(savedTimes);

        for(let i = 1; i <= 4; ++i) {
            const savedFrac = savedTimes[i - 1] / sumSavedTimes;
            const serverFrac = 400 * i / 4000;
            const absolute = Math.abs(savedFrac - serverFrac);
            expect(absolute).to.be.lessThan(0.05);
        }
    }).timeout(10000);

    it("disabledQuiz", async () => {
        await driver.find('.menu').click();
        await driver.find('.quizname').click();
        await driver.find('.startquiz').click();

        expect(await checkIfResults(driver)).to.equal(true);
    });

})