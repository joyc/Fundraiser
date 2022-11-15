const FundraiserFactoryContract = artifacts.require("FundraiserFactory");

contract("FundraiserFactory: deployment", () => {
    it("has been deployed", async () => {
        const fundraiserFactory = FundraiserFactoryContract.deployed();
        assert(fundraiserFactory, "fundraiser factory was not deployed");
    });
});

contract("FundraiserFactory: createFundraise", (accounts) => {
    let fundraiserFactory;
    // Fundraiserの引数
    const name = "Beneficiary Name";
    const url = "beneficiaryname.org";
    const imageURL = "https://placekitten.com/600/350"
    const description = "Beneficiary Description"
    const beneficiary = accounts[1];

    it("increments the fundraisersCount", async () => {
        fundraiserFactory = await FundraiserFactoryContract.deployed();
        const currentFundraisersCount = await fundraiserFactory.fundraisersCount();
        await fundraiserFactory.createFundraiser(
            name,
            url,
            imageURL,
            description,
            beneficiary
        );
        const newFundraisersCount = await fundraiserFactory.fundraisersCount();

        assert.equal(
            newFundraisersCount - currentFundraisersCount,
            1,
            "should increment by 1"
        );
    });
    // FundraiserCreated event test
    it("emits the FundraiserCreated event", async () => {
        fundraiserFactory = await FundraiserFactoryContract.deployed();
        const tx = await fundraiserFactory.createFundraiser(
            name,
            url,
            imageURL,
            description,
            beneficiary
        );
        const expectedEvent = "FundraiserCreated";
        const actualEvent = tx.logs[0].event;

        assert.equal(actualEvent, expectedEvent, "events should match");
    });
});

contract("FundraiserFactory: fundraisers", (accounts) => {
    async function createFundraiserFactory(fundraiserCount, accounts) {
        const factory = await FundraiserFactoryContract.new();
        await addFundraisers(factory, fundraiserCount, accounts);
        return factory;
    }

    async function addFundraisers(factory, count, accounts) {
        const name = "Beneficiary";
        const lowerCaseName = name.toLowerCase();
        const beneficiary = accounts[1];

        for (let i = 0; i < count; i++) {
            await factory.createFundraiser(
                // 一連のFundraiserインスタンスを作成し、それぞれをインデックスで区別する
                `${name} ${i}`,
                `${lowerCaseName}${i}.com`,
                `${lowerCaseName}${i}.png`,
                `Description for ${name} ${i}`,
                beneficiary
            );
        }
    }

    describe("when fundraisers collection is empty", () => {
        it("returns an empty collection", async () => {
            const factory = await createFundraiserFactory(0, accounts);
            const fundraisers = await factory.fundraisers(10, 0);
            assert.equal(
                fundraisers.length,
                0,
                "collection should be empty"
            );
        });
    });
});