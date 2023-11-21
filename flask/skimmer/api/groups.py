from skimmer import dal


def fetch_groups(uid):
    return dal.fetch_groups(uid)


def add_group(uid, name):
    return dal.add_group(uid, name)


def delete_group(uid, id):
    return dal.delete_group(uid, id, name)


def rename_group(uid, id, name):
    return dal.rename_group(uid, id, name)
