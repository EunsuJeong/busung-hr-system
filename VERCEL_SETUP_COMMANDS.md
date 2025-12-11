# Vercel Deployment - Quick Guide

## Step 1: Link to Vercel Project

vercel link

## Step 2: Set Environment Variables

### MONGODB_URI

vercel env add MONGODB_URI production preview development

### DB_NAME

vercel env add DB_NAME production preview development

### JWT_SECRET

vercel env add JWT_SECRET production preview development

### JWT_EXPIRES_IN

vercel env add JWT_EXPIRES_IN production preview development

## Step 3: Deploy

vercel --prod

## Environment Variable Values

You will need:

- MONGODB_URI: Your MongoDB Atlas connection string
  Example: mongodb+srv://username:password@cluster.mongodb.net/busung_hr
- DB_NAME: busung_hr

- JWT_SECRET: Any random 32+ character string
  You can generate one with:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

- JWT_EXPIRES_IN: 24h
