<template>
  <UContainer class="max-w-xl mx-auto py-12">
    <h1 class="text-3xl font-bold text-center">
      Migrate github collaborators from one repo to another
    </h1>
    <p class="text-gray-500 text-center mt-2">
      This absolutely unnecessary tool is a way to migrate github collaborators
      from one repo to another.
    </p>
    <div class="space-y-4 mt-8">
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-2">
          <UFormGroup label="Old Repo" size="lg">
            <UInput v-model="oldRepo" name="oldRepo" />
          </UFormGroup>
          <UButton
            size="lg"
            color="black"
            block
            :loading="fetchingOldUsers"
            @click="fetchOldUsers"
            >Fetch all Users</UButton
          >
        </div>
        <div class="space-y-2">
          <UFormGroup label="New Repo" size="lg">
            <UInput v-model="newRepo" name="newRepo" />
          </UFormGroup>
          <UButton size="lg" color="black" block @click="inviteToNewRepo"
            >Invite to new repo</UButton
          >
        </div>
      </div>
      <ul class="space-y-2 divide-y divide-gray-200">
        <li class="flex items-center py-2 text-sm">
          <span class="font-semibold">All Users</span>
          <span class="ml-auto">
            {{ oldUsers.length }}
          </span>
        </li>
        <li
          v-for="user in oldUsers"
          :key="user.id"
          class="flex items-center py-2"
        >
          <UAvatar :src="user.avatar_url" alt="User Avatar" />
          <span class="ml-4">{{ user.login }}</span>
          <span class="flex-1"></span>
          <Icon
            v-if="invitingUsers[user.login]"
            name="ph:spinner"
            class="w-4 h-4 animate-spin"
          />
          <Icon
            v-else-if="invitedUsers[user.login]"
            name="ph:check-circle-duotone"
            class="h-6 w-6 text-green-500"
          />
        </li>
      </ul>
    </div>
  </UContainer>
</template>

<script setup>
import { z } from "zod";
const fetchingOldUsers = ref(false);
const oldRepo = ref("");
const newRepo = ref("");
const invitingUsers = ref({});
const invitedUsers = ref({});
const oldUsers = ref([]);

const fetchOldUsers = async () => {
  fetchingOldUsers.value = true;
  const owner = oldRepo.value.split("/")[0];
  const repo = oldRepo.value.split("/")[1];
  const data = await $fetch("/api/fetch-old-users", {
    query: {
      owner,
      repo,
    },
  });
  oldUsers.value = data;
  fetchingOldUsers.value = false;
};

const inviteToNewRepo = async () => {
  const [newOwner, newRepoName] = newRepo.value.split("/");

  for (const user of oldUsers.value) {
    invitingUsers.value[user.login] = true;
    try {
      await $fetch("/api/invite-user", {
        query: {
          owner: newOwner,
          repo: newRepoName,
          username: user.login,
        },
      });
      invitedUsers.value[user.login] = true;
    } catch (error) {
      console.error(`Failed to invite ${user.login}:`, error);
    }
    invitingUsers.value[user.login] = false;
  }
};
</script>
