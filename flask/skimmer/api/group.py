from skimmer.dal.queries import add_group, delete_group, fetch_groups as fetch_groups_query, set_group


def fetch_groups(user_id, channel_id):
    result = fetch_groups_query(user_id, channel_id)
    if not result:
        raise Exception("Channel still being configured.  Come back later.")
    return result
