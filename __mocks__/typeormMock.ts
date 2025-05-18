jest.mock('@/data/AppDataSource', () => {
    const createMock = jest.fn();
    const saveMock = jest.fn();
    const findOneMock = jest.fn();

    return {
        dataSource: {
            getRepository: jest.fn(() => ({
                save: saveMock,
                findOne: findOneMock,
                create: createMock,
            })),
            __mocks: { createMock, saveMock, findOneMock }
        }
    }
});