output "tfstate_bucket" {
  value = aws_s3_bucket.tfstate.id
}

output "tfstate_lock_table" {
  value = aws_dynamodb_table.tfstate_lock.id
}
