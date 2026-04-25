import { prisma } from '../src/config/db';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';

async function main() {
  console.log('(Seeding)...');

  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const mainUser = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hashed_password_123',
      bio: 'Just a regular John Doe.',
      roles: ['USER', 'ADMIN'],
    },
  });

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'react' } }),
    prisma.tag.create({ data: { name: 'nodejs' } }),
    prisma.tag.create({ data: { name: 'prisma' } }),
  ]);

  for (let i = 0; i < 10; i++) {
    const title = faker.lorem.sentence(5);
    const article = await prisma.article.create({
      data: {
        title: title,
        slug:
          slugify(title, { lower: true, strict: true }) +
          '-' +
          faker.string.alphanumeric(4),
        description: faker.lorem.paragraph(2),
        body: faker.lorem.paragraphs(5),
        authorId: mainUser.id,
        tags: {
          connect: [
            { id: tags[Math.floor(Math.random() * tags.length)].id },
            { id: tags[Math.floor(Math.random() * tags.length)].id },
          ],
        },
      },
    });

    await prisma.comment.createMany({
      data: [
        {
          body: faker.lorem.sentence(),
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

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during the seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
