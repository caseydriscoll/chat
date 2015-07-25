<?php
/**
 * PatchChat Transient
 *
 * A patchchat is a custom post with any number of comments between any number of people
 *
 * The transient stores only what is needed of a chat log
 *
 * Stored as name 'patchchat_$id' where $id is the post id
 *
 * We don't need all the post type or comment information. This is all we need for the interface
 *
 * A patchchat is typically between two people: an end user and an agent
 *
 * Agents can change assignment. The current agent is the 'agent'
 *
 * Historic comments are stored in the 'comments' array
 *
 * This is really just a stored json piece for updating the React board
 *
 * Form:
 *
 * 'id'        => $chat->ID,
 * 'title'     => $chat->post_title,
 * 'status'    => $type, [new, open, closed]
 * 'firstTime' => The MySQL post init time
 * 'lastTime'  => The MySQL last edit time
 * 'users'     => An array of the users in the chat in key value pairs
 *     'id'        => The key of the user and also the user id
 *         'img'       => The md5 url for the gravatar
 *         'name'      => The display name
 *         'role'      => The role in the conversation, typically 'author' or 'agent' (admin?)
 *         'email'     => The email of the user
 *         'status'    => The current action, whether they are typing, here, away, gone, etc
 * 'comments'  => An array of all the comments with the given form:
 *     'text'      => The body text of the comment
 *     'time'      => The time the comment was made
 *     'type'      => The type of comment 'auto', 'action', 'normal'
 *     'user'      => The comment author user id
 *
 *
 * Methods:
 *
 * - fetch:  get a transient from the db or build it
 * - build:  build a transient from scratch if not in DB
 * - push:   adds a comment to the comments list
 * - update: update any of the fields
 */