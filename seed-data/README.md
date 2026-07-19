# MongoDB Backup
Export Date: 16:18:31 19/7/2026
Database: mongodb://localhost:27017/ctc_web_new

## Summary
- Total Collections: 14
- Total Documents: 253

## Collections
- products: 12 documents
- productcategories: 7 documents
- projects: 41 documents
- projectcategories: 8 documents
- news: 1 documents
- newscategories: 1 documents
- testimonials: 2 documents
- partners: 12 documents
- users: 2 documents
- teammembers: 2 documents
- contacts: 1 documents
- notifications: 1 documents
- settings: 1 documents
- analyticsevents: 162 documents

## How to Import
```bash
# Import single collection
mongoimport --db web-tranle1 --collection products --file products.json --jsonArray

# Import all collections
npm run import-data
```
