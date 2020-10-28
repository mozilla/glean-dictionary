import EmailAddresses from "../src/components/EmailAddresses.svelte";

export default {
  title: "Email Addresses",
};

export const SingleEmail = () => ({
  Component: EmailAddresses,
  props: {
    emails: ["glean@mozilla.com"],
  },
});

export const MultipleEmails = () => ({
  Component: EmailAddresses,
  props: {
    emails: ["example@example.com", "email@email.com", "post@pigeon.com"],
  },
});
