"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../src/utils/logger");
const db_1 = require("../src/config/db");
const faker_1 = require("@faker-js/faker");
const slugify_1 = __importDefault(require("slugify"));
async function main() {
    logger_1.logger.info('(Seeding)...');
    await db_1.prisma.comment.deleteMany();
    await db_1.prisma.article.deleteMany();
    await db_1.prisma.tag.deleteMany();
    await db_1.prisma.user.deleteMany();
    const mainUser = await db_1.prisma.user.create({
        data: {
            username: 'johndoe',
            email: 'john@example.com',
            passwordHash: 'hashed_password_123',
            bio: 'Just a regular John Doe.',
            roles: ['USER', 'ADMIN'],
        },
    });
    const tags = await Promise.all([
        db_1.prisma.tag.create({ data: { name: 'react' } }),
        db_1.prisma.tag.create({ data: { name: 'nodejs' } }),
        db_1.prisma.tag.create({ data: { name: 'prisma' } }),
    ]);
    for (let i = 0; i < 10; i++) {
        const title = faker_1.faker.lorem.sentence(5);
        const article = await db_1.prisma.article.create({
            data: {
                title: title,
                slug: (0, slugify_1.default)(title, { lower: true, strict: true }) +
                    '-' +
                    faker_1.faker.string.alphanumeric(4),
                description: faker_1.faker.lorem.paragraph(2),
                body: faker_1.faker.lorem.paragraphs(5),
                authorId: mainUser.id,
                tags: {
                    connect: [
                        { id: tags[Math.floor(Math.random() * tags.length)].id },
                        { id: tags[Math.floor(Math.random() * tags.length)].id },
                    ],
                },
            },
        });
        await db_1.prisma.comment.createMany({
            data: [
                {
                    body: faker_1.faker.lorem.sentence(),
                    articleId: article.id,
                    authorId: mainUser.id,
                },
                {
                    body: 'Another comment',
                    articleId: article.id,
                    authorId: mainUser.id,
                },
            ],
        });
    }
    logger_1.logger.info('Seeding completed!');
}
main()
    .catch((e) => {
    logger_1.logger.error('Error during the seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.prisma.$disconnect();
});
