output "k8s_master_public_ip" {
  description = "Public IP of k8s master"
  value       = aws_eip.k8s_master.public_ip
}

output "k8s_worker_1_public_ip" {
  description = "Public IP of k8s worker 1"
  value       = aws_eip.k8s_worker_1.public_ip
}

output "k8s_worker_2_public_ip" {
  description = "Public IP of k8s worker 2"
  value       = aws_eip.k8s_worker_2.public_ip
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.k8s.id
}