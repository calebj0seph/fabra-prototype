# 3D product editor prototype

## Legal notice

© 2025 Caleb Joseph. All rights reserved.

This code is shared publicly as a portfolio demonstration only. **No license is
granted and no permissions are given for its use, modification, or
distribution.** All rights remain exclusively with the copyright holder.

You may view and study this code, but may not use, copy, modify, merge,
publish, distribute, sublicense, or sell any part of it without explicit
written permission from Caleb Joseph.

## Deployment

### Prerequisites

This prototype supports deployment to AWS App Runner. You'll need the following
to deploy the app:

- An AWS account
- AWS CLI v1
  - In addition to installing the AWS CLI, you must also authenticate it so it
    can access your AWS account. See Amazon's
    [documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html)
    on how to authenticate the AWS CLI using an IAM user
- Docker
- Bash
- Node.js
- `jq`

### Instructions

1. **Clone the repository**

```sh
git clone git@github.com:calebj0seph/fabra-prototype.git
```

2. **Install dependencies with `yarn`**

```sh
cd fabra-prototype
yarn
```

3. **Build & deploy the app** \
   This will automatically create all necessary AWS resources for you. By
   default, the `ap-southeast-2` region is used.

```sh
yarn deploy
```

4. **Create a user account in the app**

```sh
curl https://<service URL>/api/register_account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "displayName": "Test User",
    "password": "<password>"
  }'
```
