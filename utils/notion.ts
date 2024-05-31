import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.EXPO_PUBLIC_NOTION_SECRET_KEY })

const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID

const fetchDB = async () => {
    const response = await notion.databases.query({
      database_id: databaseId!
    });
    console.log(response);
};

fetchDB()